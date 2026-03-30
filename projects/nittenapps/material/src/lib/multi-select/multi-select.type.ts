import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faPencil } from '@fortawesome/pro-solid-svg-icons';
import { FieldTypeConfig, StackFieldConfig, StackFieldProps } from '@nittenapps/forms';
import { StackFieldSelectProps } from '@nittenapps/forms/select';
import { Observable, startWith } from 'rxjs';

import { FieldType } from '../form-field';
import { SelectionComponent } from './selection.component';

interface MultiSelectProps extends StackFieldProps, StackFieldSelectProps {
  compareWith?: (value1: any, value2: any) => boolean;
  panelClass?: string;
}

export interface StackMultiSelectFieldConfig extends StackFieldConfig<MultiSelectProps> {
  type: 'multi-select' | Type<StackFieldMatMultiSelect>;
}

@Component({
  selector: 'nas-field-mat-multi-select',
  templateUrl: './multi-select.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
/**
 * Tipo de campo para selección múltiple asistida por mat-dialog.
 * Se usa cuando la selección requiere revisar varias opciones y mostrar un resumen legible del resultado.
 */
export class StackFieldMatMultiSelect extends FieldType<FieldTypeConfig<MultiSelectProps>> {
  readonly faPencil = faPencil;

  displayValue: string = '';

  private _options: any[] = [];

  override defaultOptions = {
    props: {
      compareWith: (value1: any, value2: any) =>
        value1?.code ? value1.code === value2?.code || value1.code === value2?.codeValue : value1 === value2,
    },
  };

  constructor(private dialog: MatDialog) {
    super();
  }

  ngOnInit() {
    this.formControl.valueChanges.pipe(startWith(this.formControl.value)).subscribe((value) => {
      if (Array.isArray(value)) {
        this.displayValue = value
          .map((v) => (v.codeValue ? v.codeValue + ' - ' : '') + (v.stringValue || ''))
          .join(', ');
      } else {
        this.displayValue = (value?.codeValue ? value.codeValue + ' - ' : '') + (value?.stringValue || '');
      }
    });

    if (this.props?.options instanceof Observable) {
      this.props.options.subscribe((options) => (this._options = options));
    } else {
      this._options = this.props?.options || [];
    }
  }

  selectValues() {
    this.dialog
      .open(SelectionComponent, {
        data: {
          options: this._options,
          field: this.field,
          value: this.formControl.value,
          compareWith: this.props.compareWith || this.defaultOptions.props!.compareWith,
        },
        width: '90%',
      })
      .afterClosed()
      .subscribe((selectedValues) => {
        if (selectedValues) {
          this.formControl.setValue(
            selectedValues.map((v: any) => (v.code ? { codeValue: v.code, stringValue: v.name, catalogValue: v } : v)),
          );
        }
      });
  }
}
