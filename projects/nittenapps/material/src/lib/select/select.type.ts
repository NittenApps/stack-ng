import { ChangeDetectionStrategy, Component, Type, ViewChild } from '@angular/core';
import { MatPseudoCheckboxState } from '@angular/material/core';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { FieldTypeConfig, StackFieldConfig, StackFieldProps, ɵobserve as observe } from '@nittenapps/forms';
import { StackFieldSelectProps } from '@nittenapps/forms/select';

import { FieldType } from '../form-field';

interface SelectProps extends StackFieldProps, StackFieldSelectProps {
  multiple?: boolean;
  selectAllOption?: string;
  disableOptionCentering?: boolean;
  typeaheadDebounceInterval?: number;
  compareWith?: (value1: any, value2: any) => boolean;
  panelClass?: string;
}

export interface StackSelectFieldConfig extends StackFieldConfig<FieldTypeConfig<SelectProps>> {
  type: 'select' | Type<StackFieldMatSelect>;
}

@Component({
  selector: 'nas-field-mat-select',
  templateUrl: './select.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StackFieldMatSelect extends FieldType<FieldTypeConfig<SelectProps>> {
  @ViewChild(MatSelect, { static: true }) set select(select: any) {
    if (!select) {
      return;
    }
    observe(select, ['_parentFormField', '_textField'], ({ currentValue }) => {
      if (currentValue) {
        select._preferredOverlayOrigin = select._parentFormField.getConnectedOverlayOrigin();
      }
    });
  }

  override defaultOptions = {
    props: {
      compareWith: (value1: any, value2: any) =>
        value1?.code ? value1.code === value2?.code || value1.code === value2?.codeValue : value1 === value2,
    },
  };

  private selectAllValue!: { options: any; value: any[] };

  change($event: MatSelectChange): void {
    if (typeof this.key === 'string' && this.key?.endsWith('catalogValue') && !$event.value) {
      const ks = this.key.substring(0, this.key.lastIndexOf('.')).split('.');
      let model = this.model;
      ks.forEach((k) => (model = model?.[k]));
      if (model) {
        model['codeValue'] = null;
        model['stringValue'] = null;
      }
    }
    this.props.change?.(this.field, $event);
  }

  formatCatalog(value: any): string {
    if (Array.isArray(value)) {
      return value.map((v) => (v.code ? v.code + ' - ' : '') + (v.name || '')).join(', ');
    }
    return (value.code ? value.code + ' - ' : '') + (value.name || '');
  }

  getSelectAllState(options: any[]): MatPseudoCheckboxState {
    if (this.empty || this.value.length === 0) {
      return 'unchecked';
    }
    return this.value.length !== this.getSelectAllValue(options).length ? 'indeterminate' : 'checked';
  }

  toggleSelectAll(options: any[]): void {
    const selectAllValue = this.getSelectAllValue(options);
    this.formControl.markAsDirty();
    this.formControl.setValue(!this.value || this.value.length !== selectAllValue.length ? selectAllValue : []);
  }

  _getAriaLabel(): string {
    return this.props.attributes?.['aria-label'] as string;
  }

  _getAriaLabelledby(): string {
    if (this.props.attributes?.['aria-labelledby']) {
      return this.props.attributes['aria-labelledby'] as string;
    }

    return this.formField?._labelId;
  }

  private getSelectAllValue(options: any[]): any[] {
    if (!this.selectAllValue || options !== this.selectAllValue.options) {
      const flatOptions: any = [];
      options.forEach((option) => (option.group ? flatOptions.push(...option.group) : flatOptions.push(option)));

      this.selectAllValue = {
        options,
        value: flatOptions.filter((option: any) => !option.disabled).map((option: any) => option.value),
      };
    }

    return this.selectAllValue.value;
  }
}
