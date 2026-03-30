import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { faBan, faPencil, faTrashCan } from '@fortawesome/pro-duotone-svg-icons';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FieldArrayType, FieldType, StackFieldConfig, ɵgetFieldValue as getFieldValue } from '@nittenapps/forms';
import { Observable } from 'rxjs';

import { StackFieldProps } from '../form-field';

interface FieldsToRender {
  key: string;
  name?: string;
  type?: string | Type<FieldType<StackFieldConfig>>;
  span: number;
  order: number;
  hidden?: boolean;
}

interface TableProps extends StackFieldProps {
  addable?: boolean;
  cancelable?: boolean;
  editable?: boolean;
  editableGroup?: boolean;
  removable?: boolean;
  removableGroup?: boolean;
  markAsDirty?: boolean;
  add?: () => Observable<any>;
  cancel?: (field: StackFieldConfig, value: any) => Observable<any>;
  edit?: (field: StackFieldConfig, value: any) => Observable<any>;
  editGroup?: (field: StackFieldConfig, values: any[]) => Observable<any>;
  valueChanges?: (table: MatTable<any>) => void;
}

export interface TableConfig extends StackFieldConfig<TableProps> {
  type: 'table' | Type<StackMatTable>;
}

@Component({
  selector: 'nas-mat-table',
  templateUrl: './table.type.html',
  styleUrl: './table.type.scss',
  standalone: false,
})
/**
 *Representa un arreglo como tabla editable con acciones por fila y por grupo
 * Se usa cuando un formulario necesita renderizar una lista de datos con opciones
 */
export class StackMatTable extends FieldArrayType<TableConfig> implements OnInit {
  @ViewChild('formTable', { static: true }) table!: MatTable<any>;

  readonly faPlus = faPlus;
  readonly faPencil = faPencil;
  readonly faTrashCan = faTrashCan;

  dataSource: MatTableDataSource<StackFieldConfig> = new MatTableDataSource();
  fieldsToRender: FieldsToRender[] = [];
  groupFields: FieldsToRender[] = [];
  groupHeaderColumns: string[] = [];
  groupSummaryColumns: string[] = [];
  headerFields: string[] = [];

  private _displayedColumns?: string[];

  get displayedColumns(): string[] {
    if (this._displayedColumns) {
      return this._displayedColumns;
    }

    this._displayedColumns = this.fieldsToRender
      .filter(
        (f) =>
          (!['_edit', '_cancel', '_delete'].includes(f.key) && f.hidden !== true) ||
          (f.key === '_edit' && this.props.editable) ||
          (f.key === '_cancel' && this.props.cancelable) ||
          (f.key === '_delete' && this.props.removable)
      )
      .map((f) => f.key);
    return this._displayedColumns;
  }

  override onPopulate(field: TableConfig): void {
    if ((field.fieldArray as StackFieldConfig)?.fieldGroup?.findIndex((f) => f.key === '_edit') === -1) {
      (field.fieldArray as StackFieldConfig)?.fieldGroup?.splice(0, 0, {
        key: '_edit',
        type: 'button',
        props: {
          icon: faPencil,
          duotone: true,
          label: 'Editar',
          onClick: this.editItem,
          order: -30,
        },
      });
    }
    if ((field.fieldArray as StackFieldConfig)?.fieldGroup?.findIndex((f) => f.key === '_cancel') === -1) {
      (field.fieldArray as StackFieldConfig)?.fieldGroup?.splice(1, 0, {
        key: '_cancel',
        type: 'button',
        props: {
          icon: faBan,
          duotone: true,
          label: 'Cancelar',
          onClick: this.cancelItem,
          order: -20,
        },
      });
    }
    if ((field.fieldArray as StackFieldConfig)?.fieldGroup?.findIndex((f) => f.key === '_delete') === -1) {
      (field.fieldArray as StackFieldConfig)?.fieldGroup?.splice(2, 0, {
        key: '_delete',
        type: 'button',
        props: {
          icon: faTrashCan,
          duotone: true,
          label: 'Eliminar',
          onClick: this.removeItem,
          order: -10,
        },
      });
    }

    super.onPopulate(field);
  }

  ngOnInit(): void {
    (this.field.props as any)['remove'] = this.remove.bind(this);
    (this.field.props as any)['replace'] = this.replace.bind(this);
    this.dataSource.data = this.field.fieldGroup || [];
    this.fieldsToRender = this.buildColumnInfo(this.field.fieldArray as StackFieldConfig);
    this.groupHeaderColumns =
      (this.field.fieldArray as StackFieldConfig)?.fieldGroup
        ?.filter((f) => f.props?.['groupHeader'])
        .map((f) => f.key!.toString()) || [];
    this.groupSummaryColumns =
      (this.field.fieldArray as StackFieldConfig)?.fieldGroup
        ?.filter((f) => f.props?.['groupSummary'])
        .map((f) => f.key!.toString()) || [];

    this.field.form?.valueChanges.subscribe(() => this.props.valueChanges?.(this.table));
  }

  addItem(): void {
    this.props.add?.().subscribe((newItem) => {
      if (!newItem) {
        return;
      }

      if (Array.isArray(newItem)) {
        newItem.forEach((ni) => this.add(undefined, ni, { markAsDirty: !(this.props?.markAsDirty === false) }));
        this.table.renderRows();
        return;
      }
      this.add(undefined, newItem, { markAsDirty: !(this.props?.markAsDirty === false) });
      this.table.renderRows();
    });
  }

  editGroup(field: StackFieldConfig): void {
    const index = +field.parent!.key!;
    if (!getFieldValue(this.dataSource.data[index])._headerRow) {
      return;
    }

    let num = 1;
    const values = [];
    for (let i = index + 1; i < this.dataSource.data.length; i++) {
      num++;
      const item = getFieldValue(this.dataSource.data[i]);
      if (item._headerRow || item._summaryRow) {
        break;
      }
      values.push(item);
    }

    field.parent!.parent!.props!['editGroup']?.(field, values)?.subscribe((value: any) => {
      if (!value) {
        return;
      }

      for (let i = 0; i < num; i++) {
        super.remove(index);
      }
      for (let i = 0; i < value.length; i++) {
        super.add(index + i, value[i], { markAsDirty: !(this.props?.markAsDirty === false) });
      }
      this.table.renderRows();
    });
  }

  getFormat(f: StackFieldConfig): string {
    if (f.props?.['format'] === 'decimal') {
      return '1.2-2';
    }
    if (f.props?.['format'] === 'integer') {
      return '1.0-0';
    }
    if (f.props?.['format'] === 'date') {
      return 'dd/MM/yyyy';
    }
    if (f.props?.['format'] === 'datetime') {
      return 'dd/MM/yyyy HH:mm';
    }
    if (f.type === 'percent' && !f.props?.['format']) {
      return '1.2-2';
    }
    return f.props?.['format'] || '';
  }

  getValue(field: StackFieldConfig): any {
    if (!field) {
      return undefined;
    }
    return getFieldValue(field);
  }

  isGroupHeader(_index: number, row: any): boolean {
    return getFieldValue(row)?._headerRow;
  }

  isGroupSummary(_index: number, row: any): boolean {
    return getFieldValue(row)?._summaryRow;
  }

  override remove(i: number): void {
    super.remove(i);
    this.table.renderRows();
  }

  removeGroup(field: StackFieldConfig): void {
    const index = +field.parent!.key!;
    if (!getFieldValue(this.dataSource.data[index])._headerRow) {
      return;
    }

    let num = 1;
    for (let i = index + 1; i < this.dataSource.data.length; i++) {
      num++;
      const item = getFieldValue(this.dataSource.data[i]);
      if (item._headerRow || item._summaryRow) {
        break;
      }
    }
    for (let i = 0; i < num; i++) {
      super.remove(index);
    }
    this.table.renderRows();
  }

  override replace(i: number, newValue: any): void {
    super.replace(i, newValue);
    this.table.renderRows();
  }

  private buildColumnInfo(array: StackFieldConfig): FieldsToRender[] {
    const groupFields: FieldsToRender[] = [];
    const fieldsToRender: FieldsToRender[] = [];
    array.fieldGroup?.forEach((f) => {
      if (f.props?.['groupHeader'] || f.props?.['groupSummary']) {
        groupFields.push({
          key: f.key!.toString(),
          type: f.type,
          span: +(f.props?.['span'] || 1),
          order: +f.props?.['order'],
          hidden: f.props?.hidden,
        });
      } else {
        fieldsToRender.push({
          name: f.props?.label,
          key: f.key!.toString(),
          type: f.type,
          span: +(f.props?.['span'] || 1),
          order: +f.props?.['order'],
          hidden: f.props?.hidden,
        });
      }
    });

    this.groupFields = groupFields.sort((f1, f2) => (f1.order > f2.order ? 1 : -1));

    return fieldsToRender.sort((f1, f2) => (f1.order > f2.order ? 1 : -1));
  }

  private cancelItem(field: StackFieldConfig): void {
    field.parent!.parent!.props!['cancel']?.(field, getFieldValue(field.parent!), {
      markAsDirty: !(this.props?.markAsDirty === false),
    });
  }

  private editItem(field: StackFieldConfig): void {
    field.parent!.parent!.props!['edit']?.(field, getFieldValue(field.parent!))?.subscribe((value: any) => {
      if (!value) {
        return;
      }

      field.parent!.parent!.props!['replace'](+field.parent!.key!, value, {
        markAsDirty: !(this.props?.markAsDirty === false),
      });
    });
  }

  private removeItem(field: StackFieldConfig): void {
    field.parent!.parent!.props!['remove'](+field.parent!.key!);
  }
}
