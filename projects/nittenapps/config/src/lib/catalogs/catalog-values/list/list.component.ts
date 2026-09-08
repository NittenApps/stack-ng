import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/**
 * Represents the catalog values list view used to display and filter catalog values.
 *
 * The component configures the list columns and applies the current filters to the
 * data source before rendering the table.
 */
@Component({
  selector: 'nas-catalog-values-list',
  imports: [FormsModule, ListToolbarComponent, StackListComponent, MatInputModule],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /**
   * Column definitions displayed in the catalog values list.
   */
  columns: Column[];

  /**
   * Active filter object applied to the list.
   */
  filter: Filter = {};

  /**
   * Local form state for the filter inputs.
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
