import { Directive, OnDestroy, QueryList, TemplateRef, Type, ViewChild, ViewChildren } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { FieldType as CoreFieldType, StackFieldConfig, ɵobserve as observe } from '@nittenapps/forms';
import { Subject } from 'rxjs';

@Directive()
/**
 * Clase base para el tipado de los componentes integrados con `mat-form-field`.
 * Expone el contrato que Angular Material necesita para foco, errores, placeholder y prefijos.
 */
export abstract class FieldType<F extends StackFieldConfig> extends CoreFieldType<F>
  implements OnDestroy, MatFormFieldControl<any> {
  @ViewChild('matPrefix') set matPrefix(prefix: TemplateRef<any>) {
    if (prefix) {
      this.props['prefix'] = prefix;
    }
  }

  @ViewChild('matTextPrefix') set matTextPrefix(textPrefix: TemplateRef<any>) {
    if (textPrefix) {
      this.props['textPrefix'] = textPrefix;
    }
  }

  @ViewChild('matSuffix') set matSuffix(suffix: TemplateRef<any>) {
    if (suffix) {
      this.props['suffix'] = suffix;
    }
  }

  @ViewChild('matTextSuffix') set matTextSuffix(textSuffix: TemplateRef<any>) {
    if (textSuffix) {
      this.props['textSuffix'] = textSuffix;
    }
  }

  @ViewChildren(MatFormFieldControl) set _controls(controls: QueryList<MatFormFieldControl<any>>) {
    this.attachControl(controls.length === 1 ? controls.first : (this as any));
  }

  get controlType(): string {
    if (this.props.type) {
      return this.props.type;
    }
    const type = this.field.type!;

    return type instanceof Type ? type.prototype.constructor.name : type;
  }

  get disabled(): boolean {
    return !!this.props.disabled;
  }

  get empty(): boolean {
    return this.value == null || this.value === '';
  }

  get errorState(): boolean {
    const showError = this.options!.showError!(this);
    if (showError !== this._errorState) {
      this._errorState = showError;
      this.stateChanges.next();
    }
    return showError;
  }

  get focused(): boolean {
    const focused = !!this.field.focus && !this.disabled;
    if (focused !== this._focused) {
      this._focused = focused;
      this.stateChanges.next();
    }
    return focused;
  }

  get formField(): MatFormField {
    return (this.field as any)?.['_formField'];
  }

  get ngControl(): any {
    return this.formControl as any;
  }

  get placeholder(): string {
    return this.props.placeholder || '';
  }

  get required(): boolean {
    return !!this.props.required;
  }

  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  get shouldPlaceholderFloat(): boolean {
    return this.shouldLabelFloat;
  }

  get value(): any {
    return this.formControl?.value;
  }

  set value(value: any) {
    this.formControl?.patchValue(value);
  }

  errorStateMatcher: ErrorStateMatcher = { isErrorState: () => this.field && this.showError };
  stateChanges = new Subject<void>();
  _errorState = false;
  _focused = false;

  ngOnDestroy() {
    delete (this.formField as any)?._control;
    this.stateChanges.complete();
  }

  onContainerClick(_event: MouseEvent): void {
    this.field.focus = true;
    this.stateChanges.next();
  }

  setDescribedByIds(_ids: string[]): void {}

  private attachControl(control: MatFormFieldControl<any>) {
    if (this.formField && control !== this.formField._control) {
      this.formField._control = control;

      // temporary fix for https://github.com/angular/material2/issues/6728
      const ngControl = control?.ngControl as any;
      if (ngControl?.valueAccessor?.hasOwnProperty('_formField')) {
        ngControl.valueAccessor['_formField'] = this.formField;
      }
      if (ngControl?.valueAccessor?.hasOwnProperty('_parentFormField')) {
        ngControl.valueAccessor['_parentFormField'] = this.formField;
      }

      ['prefix', 'suffix', 'textPrefix', 'textSuffix'].forEach((type) =>
        observe<TemplateRef<any>>(
          this.field,
          ['props', type],
          ({ currentValue }) =>
            currentValue &&
            Promise.resolve().then(() => {
              this.options?.detectChanges!(this.field);
            })
        )
      );

      // https://github.com/angular/components/issues/16209
      const setDescribedByIds = control.setDescribedByIds.bind(control);
      control.setDescribedByIds = (ids: string[]) => {
        setTimeout(() => setDescribedByIds(ids));
      };
    }
  }
}
