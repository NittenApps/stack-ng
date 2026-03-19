import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { filter, isObservable, merge, Observable, of, startWith, switchMap } from 'rxjs';
import { StackFormsConfig } from '../../services';
import { StackFieldConfig } from '../../types';
import { isObject, STACK_VALIDATORS } from '../../utils';

/**
 * The `<nas-validation-message>` component renders the error message of a given `field`.
 */
@Component({
  selector: 'nas-validation-message',
  template: '{{ errorMessage$ | async }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StackValidationMessage implements OnChanges {
  /** The field config. */
  @Input() field!: StackFieldConfig;

  errorMessage$?: Observable<string | undefined>;

  get errorMessage(): string | Observable<string> | undefined {
    const control = this.field.formControl;
    for (const error in control?.errors) {
      if (control.errors.hasOwnProperty(error)) {
        let message = this.config.getValidatorMessage(error);

        if (isObject(control.errors[error])) {
          if ((control.errors[error] as any).errorPath) {
            return undefined;
          }

          if ((control.errors[error] as any).message) {
            message = (control.errors[error] as any).message;
          }
        }

        if (this.field.validation?.messages?.[error]) {
          message = this.field.validation.messages[error];
        }

        if (this.field.validators?.[error]?.message) {
          message = this.field.validators[error].message;
        }

        if (this.field.asyncValidators?.[error]?.message) {
          message = this.field.asyncValidators[error].message;
        }

        if (typeof message === 'function') {
          return message(control.errors[error], this.field);
        }

        return message;
      }
    }

    return undefined;
  }

  constructor(private config: StackFormsConfig) {}

  ngOnChanges(_: SimpleChanges): void {
    const EXPR_VALIDATORS = STACK_VALIDATORS.map((v) => `templateOptions.${v}`);
    this.errorMessage$ = merge([
      this.field.formControl?.statusChanges,
      !this.field.options
        ? of(null)
        : this.field.options.fieldChanges?.pipe(
            filter(({ field, type, property }) => {
              return (
                field === this.field &&
                type === 'expressionChanges' &&
                (property.indexOf('validation') !== -1 || EXPR_VALIDATORS.indexOf(property) !== -1)
              );
            }),
          ),
    ]).pipe(
      startWith(null),
      switchMap(() => (isObservable(this.errorMessage) ? this.errorMessage : of(this.errorMessage))),
    );
  }
}
