import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@nittenapps/common';
import {
  BaseListComponent,
  Column,
  ListToolbarComponent,
  ListComponent as StackListComponent
} from '@nittenapps/components';

/**
 * Represents the fields list view used to display and filter fields.
 *
 * The component configures the list columns and applies the current filters to the
 * data source before rendering the table.
 */
@Component({
  selector: 'nas-fields-list',
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
    ];
  }

  protected override getActivity(): string {
    return 'configFields';
  }
}
