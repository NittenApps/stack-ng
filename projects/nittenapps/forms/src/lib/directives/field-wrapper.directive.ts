import { Directive, QueryList, ViewChild, ViewContainerRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { StackFieldConfig } from '../types';
import { FieldType } from './field-type.directive';

/** Clase base para wrappers que insertan y decoran un campo hijo. */
@Directive()
export abstract class FieldWrapper<F extends StackFieldConfig = StackFieldConfig> extends FieldType<F> {
  override set _formControls(_: QueryList<NgControl>) {}

  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent!: ViewContainerRef;

  @ViewChild('fieldComponent', { read: ViewContainerRef, static: true }) set _staticContent(content: ViewContainerRef) {
    this.fieldComponent = content;
  }
}
