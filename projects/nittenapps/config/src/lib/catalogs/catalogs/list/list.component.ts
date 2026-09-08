import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/**
 * Renders the catalog list and exposes the filtering logic used by the table.
 *
 * The component defines the visible columns and transforms the input values from
 * the filter form into the format expected by the shared list component.
 */
@Component({
  selector: 'nas-catalogs-list',
  imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /**
   * Definition of the columns displayed in the list.
   */
  columns: Column[];

  /**
   * Current filter payload sent to the list component.
   */
  filter: Filter = {};

  /**
   * Raw values captured from the search form.
   */
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
    ];
  }

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
