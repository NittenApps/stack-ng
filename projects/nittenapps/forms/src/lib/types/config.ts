import { Type } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { FieldType, FieldWrapper } from '../directives';
import { StackFieldConfig } from './field-config';

export interface ConfigOption {
  types?: TypeOption[];
  wrappers?: WrapperOption[];
  validators?: ValidatorOption[];
  extensions?: ExtensionOption[];
  validationMessages?: ValidationMessageOption[];
  extras?: {
    immutable?: boolean;
    showError?: (field: FieldType) => boolean;

    /**
     * Defines the option which stack forms rely on to check field expression properties.
     * - `modelChange`: perform a check when the value of the form control changes.
     * - `changeDetectionCheck`: triggers an immediate check when `ngDoCheck` is called.
     *
     * Defaults to `modelChange`.
     */
    checkExpressionOn?: 'modelChange' | 'changeDetectionCheck';

    /**
     * Whether to lazily render field components or not when marked as hidden.
     * - `true`: lazily render field components.
     * - `false`: render field components and use CSS to control their visibility.
     *
     * Defaults to `true`.
     */
    lazyRender?: boolean;

    /**
     * When `true`, reset the value of a hidden field.
     *
     * Defaults to `true`.
     */
    resetFieldOnHide?: boolean;

    /**
     * Whether to render fields inside <nas-field> component or not.
     *
     * Defaults to `true`.
     */
    renderStackFieldElement?: boolean;
  };
  presets?: PresetOption[];
}

export interface ExtensionOption {
  name: string;
  extension: StackFormsExtension;
  priority?: number;
}

export type FieldValidatorFn = (
  c: AbstractControl,
  field: StackFieldConfig,
  options?: { [id: string]: any },
) => ValidationErrors | null;

export interface PresetOption {
  name: string;
  config: StackFieldConfig | StackFieldConfigPresetProvider;
}

export interface StackFieldConfigPresetProvider {
  getConfiguration: () => StackFieldConfig;
}

export interface StackFormsExtension<F extends StackFieldConfig = StackFieldConfig> {
  priority?: number;

  prePopulate?(field: F): void;
  onPopulate?(field: F): void;
  postPopulate?(field: F): void;
}

export interface TypeOption {
  name: string;
  component?: Type<FieldType>;
  wrappers?: string[];
  extends?: string;
  defaultOptions?: StackFieldConfig;
}

export interface ValidationMessageOption {
  name: string;
  message: string | ((error: any, field: StackFieldConfig) => string | Observable<string>);
}

export interface ValidatorOption {
  name: string;
  validation: FieldValidatorFn;
  options?: { [id: string]: any };
}

export interface WrapperOption {
  name: string;
  component: Type<FieldWrapper>;
  types?: string[];
}
