import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/**
 * Displays and filters the list of configured fields.
 *
 * Provides sortable columns for field codes and names, along with a
 * description column and a filter form for searching by code or name.
 */
@Component({
  selector: 'nas-fields-list',
  imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /** Columns displayed in the fields list. */
  columns: Column[];

  /** Filter applied to the fields list. */
  filter: Filter = {};

  /** Values entered in the filter form. */
  _filter: { code?: string; name?: string } = {};

  /** Creates the fields list component and configures its columns. */
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
    ];
  }

  /** Applies the entered code and name values to the list filter. */
  applyFilter(): void {
    const filter: Filter = {};
    if (!!this._filter.code) {
      filter['code'] = '%' + this._filter.code.toUpperCase() + '%';
    }
    if (!!this._filter.name) {
      filter['name'] = '%' + this._filter.name + '%';
    }
    this.filter = filter;
  }
}
