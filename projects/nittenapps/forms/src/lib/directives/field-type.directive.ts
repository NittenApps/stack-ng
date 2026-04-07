import { Directive, Input, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, NgControl } from '@angular/forms';
import { StackFieldConfig, StackFieldConfigCache } from '../types';

export interface FieldTypeConfig<T = StackFieldConfig['props']> extends StackFieldConfig<T> {
  formControl: FormControl;
  props: NonNullable<T>;
}

export interface FieldGroupTypeConfig<T = StackFieldConfig['props']> extends StackFieldConfig<T> {
  formControl: FormGroup;
  props: NonNullable<T>;
}

/** Base class for field types that exposes access to the form state. */
@Directive()
export abstract class FieldType<F extends StackFieldConfig = StackFieldConfig> {
  /** Synchronizes the local controls used by the field to support expressions and wrappers. */
  @ViewChildren(NgControl) set _formControls(controls: QueryList<NgControl>) {
    const f = this.field as StackFieldConfigCache;
    f._localFields = controls
      .map((c) => (c.control as StackFieldConfigCache['formControl'])?._fields || [])
      .flat()
      .filter((f: StackFieldConfig) => f.formControl !== this.field.formControl);
  }

  @Input() field: F = {} as F;
  defaultOptions?: Partial<F>;

  get form() {
    return this.field.form;
  }

  get formControl() {
    return this.field.formControl as NonNullable<F['formControl']>;
  }

  get formState() {
    return this.options?.formState || {};
  }

  get id(): string {
    return this.field.id!;
  }

  get key() {
    return this.field.key;
  }

  get model() {
    return this.field.model;
  }

  get options() {
    return this.field.options;
  }

  get props() {
    return (this.field.props || {}) as NonNullable<F['props']>;
  }

  get showError(): boolean {
    return !!this.options?.showError?.(this);
  }
}
