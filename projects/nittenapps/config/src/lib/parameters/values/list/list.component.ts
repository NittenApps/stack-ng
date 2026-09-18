import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@nittenapps/common';
import {
  BaseListComponent,
  Column,
  ListToolbarComponent,
  ListComponent as StackListComponent,
} from '@nittenapps/components';

/**
 * Represents the parameter values list view used to display and filter parameter values.
 *
 * The component configures the list columns and applies the current filters to the
 * data source before rendering the table.
 */
@Component({
  selector: 'nas-parameters-list',
  imports: [CommonModule, FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent extends BaseListComponent {
  protected readonly columns: Column[];

  protected override readonly filters: { code?: string; name?: string } = {};

  constructor() {
    super();

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

  protected override getActivity(): string {
    return 'parametersValue';
  }

  protected override getObjectId(): string {
    return 'code';
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
