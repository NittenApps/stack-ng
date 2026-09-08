import { EventEmitter } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { StackFieldConfigCache } from '../../types';
import { defineHiddenProp, getFieldValue, getKeyPath, hasKey, isNil, observe } from '../../utils';

export function clearControl(form: StackFieldConfigCache['formControl']): void {
  delete form?._fields;
  form?.setValidators(null);
  form?.setAsyncValidators(null);
  if (form instanceof FormGroup || form instanceof FormArray) {
    Object.values(form.controls).forEach((c) => clearControl(c));
  }
}

export function findControl(field: StackFieldConfigCache): AbstractControl | null | undefined {
  if (field.formControl) {
    return field.formControl;
  }

  if (field.shareFormControl === false) {
    return null;
  }

  return field.form?.get(getKeyPath(field));
}

export function registerControl(
  field: StackFieldConfigCache,
  control?: StackFieldConfigCache['formControl'],
  emitEvent = false,
): void {
  control = control || field.formControl;

  if (!control?._fields) {
    defineHiddenProp(control, '_fields', []);
  }
  if (control?._fields?.indexOf(field) === -1) {
    control._fields.push(field);
  }

  if (!field.formControl && control) {
    defineHiddenProp(field, 'formControl', control);
    control.setValidators(null);
    control.setAsyncValidators(null);

    field.props!.disabled = !!field.props?.disabled;
    const disabledObserver = observe(field, ['props', 'disabled'], ({ firstChange, currentValue }) => {
      if (!firstChange) {
        currentValue ? field.formControl?.disable() : field.formControl?.enable();
      }
    });
    if (control instanceof FormControl) {
      control.registerOnDisabledChange(disabledObserver.setValue);
    }
  }

  if (!field.form || !hasKey(field)) {
    return;
  }

  let form = field.form;
  const paths = getKeyPath(field);
  const value = getFieldValue(field);
  if (!(isNil(control?.value) && isNil(value)) && control?.value !== value && control instanceof FormControl) {
    control.patchValue(value);
  }

  for (let i = 0; i < paths.length - 1; i++) {
    const path = paths[i];
    if (!form.get([path])) {
      (form as FormGroup).setControl(path, new FormGroup({}), { emitEvent });
    }

    form = form.get([path]) as FormGroup;
  }

  const key = paths[paths.length - 1];
  if (!field._hide && form.get([key]) !== control) {
    (form as FormGroup).setControl(key, control, { emitEvent });
  }
}

export function unregisterControl(field: StackFieldConfigCache, emitEvent = false): void {
  const control = field.formControl;
  const fieldIndex = control?._fields ? control._fields.indexOf(field) : -1;
  if (fieldIndex !== -1) {
    control?._fields?.splice(fieldIndex, 1);
  }

  const form = control?.parent as FormArray | FormGroup;
  if (!form) {
    return;
  }

  const opts = { emitEvent };
  if (form instanceof FormArray) {
    const key = form.controls.findIndex((c) => c === control);
    if (key !== -1) {
      form.removeAt(key, opts);
    }
  } else if (form instanceof FormGroup) {
    const paths = getKeyPath(field);
    const key = paths[paths.length - 1];
    if (form.get([key]) === control) {
      form.removeControl(key, opts);
    }
  }

  control?.setParent(null);
}

export function updateValidity(c: AbstractControl, onlySelf = false): void {
  const status = c.status;
  const value = c.value;
  c.updateValueAndValidity({ emitEvent: false, onlySelf });
  if (status !== c.status) {
    (c.statusChanges as EventEmitter<string>).emit(c.status);
  }

  if (value !== c.value) {
    (c.valueChanges as EventEmitter<any>).emit(c.value);
  }
}
