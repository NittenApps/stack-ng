import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { StackFieldConfig, StackFieldProps } from '@nittenapps/forms';
import { BehaviorSubject, filter, map, Observable, Subscription, tap } from 'rxjs';

export interface StackSelectOption {
  label?: string;
  disabled?: boolean;
  value?: any;
  group?: StackSelectOption[];
}

export interface StackFieldSelectProps extends StackFieldProps {
  groupProp?: string | ((option: any) => string);
  labelProp?: string | ((option: any) => string);
  valueProp?: string | ((option: any) => any);
  disabledProp?: string | ((option: any) => boolean);
}

type ITransformOption = {
  labelProp: (option: any) => string;
  valueProp: (option: any) => string;
  disabledProp: (option: any) => boolean;
  groupProp: (option: any) => string;
};

@Pipe({ name: 'stackSelectOptions' })
export class StackSelectOptionsPipe implements PipeTransform, OnDestroy {
  private _subscription?: Subscription;
  private _options?: BehaviorSubject<any[]>;

  transform(options: any, field?: StackFieldConfig): Observable<StackSelectOption[]> {
    if (!(options instanceof Observable)) {
      options = this.observableOf(options, field);
    } else {
      this.dispose();
    }

    return (options as Observable<any>).pipe(map((value) => this.transformOptions(value, field)));
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private dispose(): void {
    if (this._options) {
      this._options.complete();
      this._options = undefined;
    }

    if (this._subscription) {
      this._subscription.unsubscribe();
      this._subscription = undefined;
    }
  }

  private observableOf(options: any, f?: StackFieldConfig): Observable<any> {
    this.dispose();
    if (f && f.options && f.options.fieldChanges) {
      this._subscription = f.options.fieldChanges
        .pipe(
          filter(({ property, type, field }) => {
            return (
              type === 'expressionChanges' &&
              property.indexOf('props.options') === 0 &&
              field === f &&
              Array.isArray(field.props?.options) &&
              !!this._options
            );
          }),
          tap(() => this._options?.next(f.props?.options as any))
        )
        .subscribe();
    }

    this._options = new BehaviorSubject(options);
    return this._options.asObservable();
  }

  private transformOption(option: any, props: ITransformOption, multiple: boolean): StackSelectOption {
    const group = props.groupProp(option);
    if (Array.isArray(group)) {
      return {
        label: props.labelProp(option),
        group: group.map((opt) => this.transformOption(opt, props, multiple)),
      };
    }

    if (multiple && option.code) {
      option = { ...option, catalogValue: { code: option.code, name: option.name } };
    }

    option = {
      label: props.labelProp(option) || (option.code ? option.code + ' - ' : '') + option.name,
      value: props.valueProp(option) || option,
      disabled: !!props.disabledProp(option),
    };

    if (group) {
      return { label: group, group: [option] };
    }

    return option;
  }

  private transformOptions(options: any[], field?: StackFieldConfig): StackSelectOption[] {
    const to = this.transformSelectProps(field);
    const opts: StackSelectOption[] = [];
    const groups: { [id: string]: number } = {};

    options?.forEach((option) => {
      const o = this.transformOption(option, to, !!field?.props?.['multiple']);
      if (o.group) {
        const id = groups[o.label!];
        if (id === undefined) {
          groups[o.label!] = opts.push(o) - 1;
        } else {
          o.group.forEach((o) => opts[id].group?.push(o));
        }
      } else {
        opts.push(o);
      }
    });

    return opts;
  }

  private transformSelectProps(field?: StackFieldConfig): ITransformOption {
    const props = field?.props || {};
    const selectPropFn = (prop: any) => (typeof prop === 'function' ? prop : (o: any) => o[prop]);

    return {
      groupProp: selectPropFn(props['groupProp'] || 'group'),
      labelProp: selectPropFn(props['labelProp'] || 'label'),
      valueProp: selectPropFn(props['valueProp'] || 'value'),
      disabledProp: selectPropFn(props['disabledProp'] || 'disabled'),
    };
  }
}
