import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/** Displays and filters the list of configuration parameter values. */
@Component({
  selector: 'nas-parameters-list',
  imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /** Columns displayed in the parameter values list. */
  columns: Column[];

  /** Filter currently applied to the list. */
  filter: Filter = {};

  /** Filter values entered by the user before they are applied. */
  _filter: { code?: string; name?: string } = {};

  constructor() {
    this.columns = [
      {
        id: 'code',
        title: 'Código',
        sortable: true,
      },
      {
        id: 'name',
        title: 'Nombre',
        sortable: true,
      },
      {
        id: 'description',
        title: 'Descripción',
      },
      {
        id: 'value',
        title: 'Valor',
        value: this.getValue,
      },
    ];
  }

  /** Applies the entered code and name filters to the list. */
  applyFilter(): void {
    const filter: Filter = {};
    if (!!this._filter.code) {
      filter['code'] = this._filter.code.toUpperCase();
    }
    if (!!this._filter.name) {
      filter['name'] = this._filter.name;
    }
    this.filter = filter;
  }

  /**
   * Formats a parameter value according to its type.
   *
   * @param id Column identifier.
   * @param item Parameter value item.
   * @returns The formatted value for the requested column.
   */
  private getValue(id: string, item?: any): string {
    switch (id) {
      case 'value':
        switch (item?.type) {
          case 'AN':
            return item?.stringValue;
          case 'NM':
            return item?.numberValue;
          case 'BL':
            return item?.booleanValue ? 'Sí' : 'No';
          default:
            return '';
        }
    }
    return '';
  }
}
