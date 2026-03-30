import { Injectable, Injector, Optional, ViewContainerRef } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { StackFormsConfig } from './config.service';
import { StackFieldConfig, StackFieldConfigCache, StackFormOptions } from '../types';
import { defineHiddenProp, disableTreeValidityCall, isHiddenField, isSignalRequired, observe } from '../utils';

/**
 * Servicio encargado de construir la estructura interna del formulario y ejecutar las extensiones registradas.
 */
@Injectable({ providedIn: 'root' })
export class StackFormBuilder {
  constructor(
    private config: StackFormsConfig,
    private injector: Injector | null,
    @Optional() private viewContainerRef: ViewContainerRef | null,
    @Optional() private parentForm: FormGroupDirective | null
  ) {}

  /**
   * Construye un formulario raíz a partir del grupo de campos y el modelo recibido.
   * @param form Instancia de formulario que contendrá los controles.
   * @param fieldGroup Configuración de campos raíz.
   * @param model Modelo inicial del formulario.
   * @param options Opciones compartidas del formulario.
   */
  buildForm(form: FormGroup | FormArray, fieldGroup: StackFieldConfig[] = [], model: any, options: StackFormOptions) {
    this.build({ fieldGroup, model, form, options });
  }

  /**
   * Ejecuta el pipeline de extensiones sobre un campo y sus hijos.
   * @param field Campo raíz o parcial que se debe construir.
   */
  build(field: StackFieldConfig) {
    if (!this.config.extensions['core']) {
      throw new Error('NgxFormly: missing `forRoot()` call. use `forRoot()` when registering the `FormlyModule`.');
    }

    if (!field.parent) {
      this._setOptions(field);
    }

    disableTreeValidityCall(field.form, () => {
      this._build(field);
      // TODO: add test for https://github.com/ngx-formly/ngx-formly/issues/3910
      if (!field.parent || (field as StackFieldConfigCache).fieldArray) {
        // detect changes early to avoid reset value by hidden fields
        const options = (field as StackFieldConfigCache).options;

        if (field.parent && isHiddenField(field)) {
          // when hide is used in expression set defaul value will not be set until detect hide changes
          // which causes default value not set on new item is added
          options?._hiddenFieldsForCheck?.push({ field, default: false });
        }

        options?.checkExpressions?.(field, true);
        options?._detectChanges?.(field);
      }
    });
  }

  private _build(field: StackFieldConfigCache) {
    if (!field) {
      return;
    }

    const extensions = Object.values(this.config.extensions);
    extensions.forEach((extension) => extension.prePopulate?.(field));
    extensions.forEach((extension) => extension.onPopulate?.(field));
    field.fieldGroup?.forEach((f) => this._build(f));
    extensions.forEach((extension) => extension.postPopulate?.(field));
  }

  private _setOptions(field: StackFieldConfigCache) {
    field.form = field.form || new FormGroup({});
    field.model = field.model || {};
    field.options = field.options || {};
    const options = field.options;

    if (!options._viewContainerRef) {
      defineHiddenProp(options, '_viewContainerRef', this.viewContainerRef);
    }

    if (!options._injector) {
      defineHiddenProp(options, '_injector', this.injector);
    }

    if (!options.build) {
      options.build = (f: StackFieldConfig = field): StackFieldConfig => {
        this.build(f);
        return f;
      };
    }

    if (!options.parentForm && this.parentForm) {
      defineHiddenProp(options, 'parentForm', this.parentForm);

      if (!isSignalRequired()) {
        observe(options, ['parentForm', 'submitted'], ({ firstChange }) => {
          if (!firstChange) {
            options.detectChanges?.(field);
          }
        });
      }
    }
  }
}
