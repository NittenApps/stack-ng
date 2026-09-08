/**
 * Represents the list module component used to render and filter a collection of modules.
 *
 * This component configures the table columns, manages the current filter state, and
 * applies text-based filters for module code and name before emitting the updated filter
 * to the underlying list component.
 */
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/**
 * Angular component that renders the modules table and applies filter criteria from the toolbar.
 *
 * The component stores the configured table columns, keeps a local form model for the active
 * filter values, and publishes the final filter object to the underlying stack list component.
 *
 * @example
 * <nas-moduless-list></nas-moduless-list>
 */
@Component({
  selector: 'nas-moduless-list',
  imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /**
   * Column definitions used by the list table.
   */
  columns: Column[];

  /**
   * Active filter object passed to the list component.
   */
  filter: Filter = {};

  /**
   * Local internal filter values entered by the user in the toolbar form.
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

  /**
   * Builds a Filter object from the current form values.
   *
   * The code filter is normalized to uppercase and wrapped with SQL-style wildcards,
   * while the name filter includes wildcard characters to support partial matching.
   */
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
