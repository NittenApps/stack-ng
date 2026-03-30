import { isObservable, Observable, tap } from 'rxjs';
import { StackFieldConfigCache, StackFormsExtension, StackFormValueChangeEvent } from '../../types';
import {
  assignFieldValue,
  defineHiddenProp,
  getFieldValue,
  hasKey,
  isFunction,
  isNil,
  isObject,
  isUndefined,
  observe,
} from '../../utils';
import { evalExpression, evalStringExpression } from './utils';
import { FormArray } from '@angular/forms';
import { registerControl, unregisterControl, updateValidity } from '../field-form/utils';

/**
 * Clase encargada de evaluar y aplicar expresiones dinámicas en los campos de un formulario
 */
export class FieldExpressionExtension implements StackFormsExtension {
  onPopulate(field: StackFieldConfigCache) {
    if (field._expressions) {
      return;
    }

    // cache built expression
    defineHiddenProp(field, '_expressions', {});

    observe(field, ['hide'], ({ currentValue, firstChange }) => {
      defineHiddenProp(field, '_hide', !!currentValue);
      if (!firstChange || (firstChange && currentValue === true)) {
        field.props!.hidden = currentValue;
        field.options?._hiddenFieldsForCheck?.push({ field });
      }
    });

    const evalExpr = (key: string, expr: any): void => {
      if (typeof expr === 'string' || isFunction(expr)) {
        field._expressions![key] = this.parseExpressions(field, key, expr);
      } else if (expr instanceof Observable) {
        field._expressions![key] = {
          value$: (expr as Observable<any>).pipe(
            tap((v) => {
              this.evalExpr(field, key, v);
              field.options?._detectChanges?.(field);
            })
          ),
        };
      }
    };

    field.expressions = field.expressions || {};
    for (const key of Object.keys(field.expressions)) {
      observe(field, ['expressions', key], ({ currentValue: expr }) => {
        evalExpr(key, isFunction(expr) ? (...args: any): any => expr(field, args[3]) : expr);
      });
    }
  }

  postPopulate(field: StackFieldConfigCache) {
    if (field.parent) {
      return;
    }

    if (!field.options!.checkExpressions) {
      let checkLocked = false;
      field.options!.checkExpressions = (f, ignoreCache): void => {
        if (checkLocked) {
          return;
        }

        checkLocked = true;
        const fieldChanged = this.checkExpressions(f, ignoreCache);
        const options = field.options!;
        options._hiddenFieldsForCheck
          ?.sort((f) => (f.field.hide ? -1 : 1))
          .forEach((f) => this.changeHideState(f.field, f.field.hide ?? !!f.default, !ignoreCache));
        options._hiddenFieldsForCheck = [];
        if (fieldChanged) {
          this.checkExpressions(field);
        }
        checkLocked = false;
      };
    }
  }

  private _evalExpressionPath(field: StackFieldConfigCache, prop: string) {
    if (field._expressions?.[prop] && field._expressions[prop].paths) {
      return field._expressions[prop].paths;
    }

    let paths: string[] = [];
    if (prop.indexOf('[') === -1) {
      paths = prop.split('.');
    } else {
      prop
        .split(/[[\]]{1,2}/) // https://stackoverflow.com/a/20198206
        .filter((p) => p)
        .forEach((path) => {
          const arrayPath = path.match(/['|"](.*?)['|"]/);
          if (arrayPath) {
            paths.push(arrayPath[1]);
          } else {
            paths.push(...path.split('.').filter((p) => p));
          }
        });
    }

    if (field._expressions?.[prop]) {
      field._expressions[prop].paths = paths;
    }

    return paths;
  }

  private changeDisabledState(field: StackFieldConfigCache, value: boolean) {
    if (field.fieldGroup) {
      field.fieldGroup
        .filter((f: StackFieldConfigCache) => !f._expressions?.hasOwnProperty('props.disabled'))
        .forEach((f) => this.changeDisabledState(f, value));
    }

    if (hasKey(field) && field.props?.disabled !== value) {
      field.props!.disabled = value;
    }
  }

  private changeHideState(field: StackFieldConfigCache, hide: boolean, resetOnHide: boolean) {
    if (field.fieldGroup) {
      field.fieldGroup
        .filter((f: StackFieldConfigCache) => f && !f._expressions?.['hide'])
        .forEach((f) => this.changeHideState(f, hide, resetOnHide));
    }

    if (field.formControl && hasKey(field)) {
      defineHiddenProp(field, '_hide', !!(hide || field.hide));
      const c = field.formControl;
      if ((c._fields?.length || 0) > 1) {
        updateValidity(c);
      }

      if (hide === true && (!c._fields || c._fields.every((f) => !!f._hide))) {
        unregisterControl(field, true);
        if (resetOnHide && field.resetOnHide) {
          assignFieldValue(field, undefined);
          field.formControl.reset({ value: undefined, disabled: field.formControl.disabled });
          field.options?.fieldChanges?.next({ value: undefined, field, type: 'valueChanges' });
          if (field.fieldGroup && field.formControl instanceof FormArray) {
            field.fieldGroup.length = 0;
          }
        }
      } else if (hide === false) {
        if (field.resetOnHide && !isUndefined(field.defaultValue) && isUndefined(getFieldValue(field))) {
          assignFieldValue(field, field.defaultValue);
        }
        registerControl(field, undefined, true);
        if (field.resetOnHide && field.fieldArray && field.fieldGroup?.length !== field.model?.length) {
          field.options?.build?.(field);
        }
      }
    }

    if (field.options?.fieldChanges) {
      field.options.fieldChanges.next(<StackFormValueChangeEvent>{ field, type: 'hidden', value: hide });
    }
  }

  private checkExpressions(field: StackFieldConfigCache, ignoreCache = false): boolean {
    if (!field) {
      return false;
    }

    let fieldChanged = false;
    if (field._expressions) {
      for (const key of Object.keys(field._expressions)) {
        field._expressions[key].callback?.(ignoreCache) && (fieldChanged = true);
      }
    }
    field.fieldGroup?.forEach((f) => this.checkExpressions(f, ignoreCache) && (fieldChanged = true));

    return fieldChanged;
  }

  private emitExpressionChanges(field: StackFieldConfigCache, property: string, value: any) {
    if (!field.options?.fieldChanges) {
      return;
    }

    field.options.fieldChanges.next({
      field,
      type: 'expressionChanges',
      property,
      value,
    });
  }

  private evalExpr(field: StackFieldConfigCache, prop: string, value: any) {
    if (prop.indexOf('model.') === 0) {
      const key = prop.replace(/^model\./, ''),
        parent = field.fieldGroup ? field : field.parent;

      let control = field?.key === key ? field.formControl : field.form?.get(key);
      if (!control && field.get?.(key)) {
        control = field.get?.(key).formControl;
      }
      assignFieldValue({ key, parent, model: field.model }, value);
      if (control && !(isNil(control.value) && isNil(value)) && control.value !== value) {
        control.patchValue(value);
      }
    } else {
      try {
        let target: any = field;
        const paths = this._evalExpressionPath(field, prop);
        const lastIndex = paths.length - 1;
        for (let i = 0; i < lastIndex; i++) {
          target = target[paths[i]];
        }

        target[paths[lastIndex]] = value;
      } catch (error) {
        (error as any).message = `[StackForms Error] [Expression "${prop}"] ${(error as any).message}`;
        throw error;
      }

      if (['props.disabled'].includes(prop) && hasKey(field)) {
        this.changeDisabledState(field, value);
      }
    }

    this.emitExpressionChanges(field, prop, value);
  }

  private parseExpressions(field: StackFieldConfigCache, path: string, expr: any) {
    let parentExpression: any;
    if (field.parent && ['hide', 'props.disabled'].includes(path)) {
      const rootValue = (f: StackFieldConfigCache): boolean => {
        return path === 'hide' ? !!f.hide : !!f.props?.disabled;
      };

      parentExpression = () => {
        let root = field.parent!;
        while (root.parent && !rootValue(root)) {
          root = root.parent;
        }

        return rootValue(root);
      };
    }

    expr = expr || (() => false);
    if (typeof expr === 'string') {
      expr = evalStringExpression(expr, ['model', 'formState', 'field']);
    }

    let currentValue: any;

    return {
      callback: (ignoreCache?: boolean) => {
        try {
          const exprValue = evalExpression(
            parentExpression ? (...args: any) => parentExpression(field) || expr(...args) : expr,
            { field },
            [field.model, field.options?.formState, field, ignoreCache]
          );

          if (
            ignoreCache ||
            (currentValue !== exprValue &&
              (!isObject(exprValue) ||
                isObservable(exprValue) ||
                JSON.stringify(exprValue) !== JSON.stringify(currentValue)))
          ) {
            currentValue = exprValue;
            this.evalExpr(field, path, exprValue);

            return true;
          }

          return false;
        } catch (error) {
          (error as any).message = `[StackForms Error] [Expression "${path}"] ${(error as any).message}`;
          throw error;
        }
      },
    };
  }
}
