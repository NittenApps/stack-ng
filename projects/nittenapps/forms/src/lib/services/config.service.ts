import { ComponentRef, Injectable, InjectionToken, Type } from '@angular/core';
import { FieldType, FieldWrapper } from '../directives';
import {
  ConfigOption,
  ExtensionOption,
  StackFieldConfig,
  StackFieldConfigCache,
  StackFieldConfigPresetProvider,
  StackFormsExtension,
  TypeOption,
  ValidationMessageOption,
  ValidatorOption,
  WrapperOption,
} from '../types';
import { defineHiddenProp, reverseDeepMerge } from '../utils';

/**
 * InjectionToken for registering additional stack forms config options (types, wrappers ...).
 */
export const STACK_FORMS_CONFIG = new InjectionToken<ConfigOption[]>('STACK_FORMS_CONFIG');

/**
 * Maintains list of stack forms config options. This can be used to register new field type.
 */
@Injectable({ providedIn: 'root' })
export class StackFormsConfig {
  types: { [name: string]: TypeOption } = {};
  validators: { [name: string]: ValidatorOption } = {};
  wrappers: { [name: string]: WrapperOption } = {};
  messages: { [name: string]: ValidationMessageOption['message'] } = {};

  extras: NonNullable<ConfigOption['extras']> = {
    checkExpressionOn: 'modelChange',
    lazyRender: true,
    resetFieldOnHide: true,
    renderStackFieldElement: true,
    showError(field: FieldType) {
      return (
        field.formControl?.invalid &&
        (field.formControl?.touched || field.options?.parentForm?.submitted || !!field.field.validation?.show)
      );
    },
  };
  extensions: { [name: string]: StackFormsExtension } = {};
  presets: { [name: string]: StackFieldConfig | StackFieldConfigPresetProvider } = {};

  private extensionsByPriority: Record<number, { [name: string]: StackFormsExtension }> = {};

  addConfig(config: ConfigOption) {
    if (config.types) {
      config.types.forEach((type) => this.setType(type));
    }
    if (config.validators) {
      config.validators.forEach((validator) => this.setValidator(validator));
    }
    if (config.wrappers) {
      config.wrappers.forEach((wrapper) => this.setWrapper(wrapper));
    }
    if (config.validationMessages) {
      config.validationMessages.forEach((validation) => this.addValidatorMessage(validation.name, validation.message));
    }
    if (config.extensions) {
      this.setSortedExtensions(config.extensions);
    }
    if (config.extras) {
      this.extras = { ...this.extras, ...config.extras };
    }
    if (config.presets) {
      this.presets = {
        ...this.presets,
        ...config.presets.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.config }), {}),
      };
    }
  }

  addValidatorMessage(name: string, message: ValidationMessageOption['message']) {
    this.messages[name] = message;
  }

  /** @internal */
  getMergedField(field: StackFieldConfig = {}): any {
    const type = this.getType(field.type);
    if (!type) {
      return;
    }

    if (type.defaultOptions) {
      reverseDeepMerge(field, type.defaultOptions);
    }

    const extendDefaults = type.extends && this.getType(type.extends)?.defaultOptions;
    if (extendDefaults) {
      reverseDeepMerge(field, extendDefaults);
    }

    const componentRef = this.resolveFieldTypeRef(field);
    if (componentRef?.instance?.defaultOptions) {
      reverseDeepMerge(field, componentRef.instance.defaultOptions);
    }

    if (!field.wrappers && type.wrappers) {
      field.wrappers = [...type.wrappers];
    }
  }

  getType(name: StackFieldConfig['type'], throwIfNotFound = false): TypeOption | null {
    if (name instanceof Type) {
      return { component: name, name: name.prototype.constructor.name };
    }

    if (!name || !this.types[name]) {
      if (throwIfNotFound) {
        throw new Error(
          `[StackForms Error] The type "${name}" could not be found. Please make sure that is registered through the StackFormsModule declaration.`,
        );
      }

      return null;
    }

    this.mergeExtendedType(name);

    return this.types[name];
  }

  getValidator(name: string): ValidatorOption {
    if (!this.validators[name]) {
      throw new Error(
        `[StackForms Error] The validator "${name}" could not be found. Please make sure that is registered through the StackFormsModule declaration.`,
      );
    }

    return this.validators[name];
  }

  getValidatorMessage(name: string) {
    return this.messages[name];
  }

  getWrapper(name: string | Type<FieldWrapper>): WrapperOption {
    if (name instanceof Type) {
      return { component: name, name: name.prototype.constructor.name };
    }

    if (!this.wrappers[name]) {
      throw new Error(
        `[StackForms Error] The wrapper "${name}" could not be found. Please make sure that is registered through the StackFormsModule declaration.`,
      );
    }

    return this.wrappers[name];
  }

  /** @internal */
  resolveFieldTypeRef(field: StackFieldConfigCache = {}): ComponentRef<FieldType> | null | undefined {
    const type: (TypeOption & { _componentRef?: ComponentRef<any> }) | null = this.getType(field.type);
    if (!type) {
      return null;
    }

    if (!type.component || type._componentRef) {
      return type._componentRef;
    }

    const { _viewContainerRef, _injector } = field.options || {};
    if (!_viewContainerRef || !_injector) {
      return null;
    }

    const componentRef = _viewContainerRef.createComponent<FieldType>(type.component, { injector: _injector });
    defineHiddenProp(type, '_componentRef', componentRef);
    try {
      componentRef.destroy();
    } catch (e) {
      console.error(`An error occurred while destroying the StackForms component type "${field.type}"`, e);
    }

    return type._componentRef;
  }

  /**
   * Allows you to specify a custom type which you can use in your field configuration.
   * You can pass an object of options, or an array of objects of options.
   */
  setType(options: TypeOption | TypeOption[]) {
    if (Array.isArray(options)) {
      options.forEach((option) => this.setType(option));
    } else {
      if (!this.types[options.name]) {
        this.types[options.name] = <TypeOption>{ name: options.name };
      }

      (['component', 'extends', 'defaultOptions', 'wrappers'] as (keyof TypeOption)[]).forEach((prop) => {
        if (options.hasOwnProperty(prop)) {
          this.types[options.name][prop] = options[prop] as any;
        }
      });
    }
  }

  /** @internal */
  setTypeWrapper(type: string, name: string) {
    if (!this.types[type]) {
      this.types[type] = <TypeOption>{};
    }
    if (!this.types[type].wrappers) {
      this.types[type].wrappers = [];
    }
    if (this.types[type].wrappers.indexOf(name) === -1) {
      this.types[type].wrappers.push(name);
    }
  }

  setValidator(options: ValidatorOption) {
    this.validators[options.name] = options;
  }

  setWrapper(options: WrapperOption) {
    this.wrappers[options.name] = options;
    if (options.types) {
      options.types.forEach((type) => {
        this.setTypeWrapper(type, options.name);
      });
    }
  }

  private mergeExtendedType(name: string) {
    if (!this.types[name].extends) {
      return;
    }

    const extendedType = this.getType(this.types[name].extends);
    if (!this.types[name].component) {
      this.types[name].component = extendedType?.component;
    }

    if (!this.types[name].wrappers) {
      this.types[name].wrappers = extendedType?.wrappers;
    }
  }

  private setSortedExtensions(extensionOptions: ExtensionOption[]) {
    // insert new extensions, grouped by priority
    extensionOptions.forEach((extensionOption) => {
      const priority = extensionOption.priority ?? 1;
      this.extensionsByPriority[priority] = {
        ...this.extensionsByPriority[priority],
        [extensionOption.name]: extensionOption.extension,
      };
    });
    // flatten extensions object with sorted keys
    this.extensions = Object.keys(this.extensionsByPriority)
      .map(Number)
      .sort((a, b) => a - b)
      .reduce(
        (acc, prio) => ({
          ...acc,
          ...this.extensionsByPriority[prio],
        }),
        {},
      );
  }
}
