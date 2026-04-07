import { Type } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormGroup,
  FormGroupDirective,
  ValidatorFn,
} from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { FieldType, FieldWrapper } from '../directives';
import { ValidationMessageOption } from './config';

type FieldExpression<T = any> = string | ((field: StackFieldConfig) => T) | Observable<T>;
type FieldExpressions = { [property: string]: FieldExpression } & {
  className?: FieldExpression<string>;
  hide?: FieldExpression<boolean>;
  'props.disabled'?: FieldExpression<boolean>;
  'props.required'?: FieldExpression<boolean>;
};
/** Interface where the form configuration is defined. */

export interface StackFieldConfig<P = StackFieldProps & { [additionalProperties: string]: any }> {
  /**
   * The key that relates to the model. This will link the field value to the model
   */
  key?: string | number | (string | number)[] | null;

  /**
   * This should be a formly-field type added either by you or a plugin. More information over at
   * Creating Formly Fields.
   */
  type?: string | Type<FieldType>;

  /**
   * Use `defaultValue` to initialize it the model. If this is provided and the value of the model
   * at compile-time is undefined, then the value of the model will be assigned to `defaultValue`.
   */
  defaultValue?: any;

  /**
   * This allows you to specify the `id` of your field. Note, the `id` is generated if not set.
   */
  id?: string;

  /**
   * If you wish, you can specify a specific `name` for your field. This is useful if you're
   * posting the form to a server using techniques of yester-year.
   */
  name?: string;

  /**
   * This is reserved for the templates. Any template-specific options go in here. Look at your
   * specific template implementation to know the options required for this.
   */
  props?: P;

  /**
   * An object with a few useful properties
   * - `validation.messages`: A map of message names that will be displayed when the field has
   *     errors.
   * - `validation.show`: A boolean you as the developer can set to force displaying errors
   *     whatever the state of field. This is useful when you're trying to call the user's
   *     attention to some fields for some reason.
   */
  validation?: {
    messages?: { [messageProperties: string]: ValidationMessageOption['message'] };
    show?: boolean;
    [additionalProperties: string]: any;
  };

  /**
   * Used to set validation rules for a particular field.
   * Should be an object of key - value pairs. The value can either be an expression to evaluate or
   * a function to run. Each should return a boolean value, returning true when the field is valid.
   * See Validation for more information.
   */
  validators?: StackValidation<ValidatorFn, boolean>;

  /**
   * Use this one for anything that needs to validate asynchronously.
   * Pretty much exactly the same as the validators api, except it must be a function that returns
   * a promise or observable.
   */
  asyncValidators?: StackValidation<AsyncValidatorFn, Promise<boolean> | Observable<boolean>>;

  /**
   * Can be set instead of `type` to render custom html content.
   */
  template?: string;

  /**
   * It is expected to be the name of the wrappers.
   * The formly field template will be wrapped by the first wrapper, then the second, then the
   * third, etc.
   * You can also specify these as part of a type (which is the recommended approach).
   */
  wrappers?: (string | Type<FieldWrapper>)[];

  /**
   * Whether to hide the field. Defaults to false. If you wish this to be conditional use
   * `expressions: { hide: ... }`
   */
  hide?: boolean;

  /**
   * Whether to reset the value on hide or not. Defaults to `true`.
   */
  resetOnHide?: boolean;

  /**
   * An object where the key is a property to be set on the main field config and the value is an
   * expression used to assign that property.
   */
  expressions?: FieldExpressions;

  /**
   * You can specify your own class that will be applied to the `formly-field` component.
   */
  className?: string;

  /**
   * Specify your own class that will be applied to the `formly-group` component.
   */
  fieldGroupClassName?: string;

  /**
   * A field group is a way to group fields together, making advanced layout very simple.
   * It can also be used to group fields that are associated with the same model (useful if it's different than the model for the rest of the fields).
   */
  fieldGroup?: StackFieldConfig[];

  fieldArray?: StackFieldConfig | ((field: StackFieldConfig) => StackFieldConfig);

  /**
   * Whether to focus or blur the element field. Defaults to false. If you wish this to be conditional use `expressions`
   */
  focus?: boolean;

  /**
   * An object with a few useful properties to control the model changes
   * - `debounce`: integer value which contains the debounce model update value in milliseconds. A value of 0 triggers an immediate update.
   * - `updateOn`: string event value that instructs when the control should be updated
   */
  modelOptions?: {
    debounce?: {
      default: number;
    };
    // @see https://angular.io/api/forms/AbstractControl#updateOn
    updateOn?: 'change' | 'blur' | 'submit';
  };

  hooks?: StackFormsHookConfig;

  /**
   * Array of functions to execute, as a pipeline, whenever the model updates, usually via user input.
   */
  parsers?: ((value: any) => any)[];

  /**
   * Returns child field by key name
   */
  get?: (key: StackFieldConfig['key']) => StackFieldConfig;

  /**
   * The model that stores all the data, where the model[key] is the value of the field
   */
  readonly model?: any;

  /**
   * The parent field.
   */
  readonly parent?: StackFieldConfig;

  /**
   * The form options.
   */
  readonly options?: StackFormOptions;

  /**
   * The parent form.
   */
  readonly form?: FormGroup | FormArray;

  /**
   * This is the [FormControl](https://angular.io/api/forms/FormControl) for the field.
   * It provides you more control like running validators, calculating status, and resetting state.
   */
  readonly formControl?: AbstractControl;
}

export interface StackFieldProps {
  type?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  options?: any[] | Observable<any[]>;
  rows?: number;
  cols?: number;
  description?: string;
  hidden?: boolean;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  pattern?: string | RegExp;
  required?: boolean;
  tabindex?: number;
  readonly?: boolean;
  attributes?: { [key: string]: string | number | null };
  step?: number;
  focus?: StackFormsAttributeEvent;
  blur?: StackFormsAttributeEvent;
  keyup?: StackFormsAttributeEvent;
  keydown?: StackFormsAttributeEvent;
  click?: StackFormsAttributeEvent;
  change?: StackFormsAttributeEvent;
  keypress?: StackFormsAttributeEvent;
}

export interface StackFormOptions {
  updateInitialValue?: (model?: any) => void;
  resetModel?: (model?: any) => void;
  formState?: any;
  fieldChanges?: Subject<StackFormValueChangeEvent>;
  showError?: (field: FieldType) => boolean;
  build?: (field?: StackFieldConfig) => StackFieldConfig;
  checkExpressions?: (field: StackFieldConfig) => void;
  detectChanges?: (field: StackFieldConfig) => void;
  parentForm?: FormGroupDirective | null;
}

export interface StackFormValueChangeEvent {
  field: StackFieldConfig;
  type: string;
  value: any;
  [meta: string]: any;
}

export type StackFormsAttributeEvent = (field: StackFieldConfig, event?: any) => void;

export interface StackFormsHookConfig {
  onInit?: StackFormsHookFn | ((field: StackFieldConfig) => Observable<any>);
  onChanges?: StackFormsHookFn;
  afterContentInit?: StackFormsHookFn;
  afterViewInit?: StackFormsHookFn;
  onDestroy?: StackFormsHookFn;
}

export type StackFormsHookFn = (field: StackFieldConfig) => void;

interface StackValidation<T, R> {
  validation?: (string | T)[] | any;
  [key: string]: StackValidatorFn<R> | StackValidatorExpressionFn<R> | any;
}

type StackValidatorFn<T> = (control: AbstractControl, field: StackFieldConfig) => T;

interface StackValidatorExpressionFn<T> {
  expression: StackValidatorFn<T>;
  message: string | ((error: any, field: StackFieldConfig) => string | Observable<string>);
}
