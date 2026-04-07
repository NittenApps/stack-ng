import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, ListComponent as StackListComponent, ListToolbarComponent, Filter } from '@nittenapps/components';

@Component({
    selector: 'nas-fields-list',
    imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
    templateUrl: './list.component.html'
})
/** List component for listing the fields used in forms, responsible for displaying a table with their values and allowing filters to be applied. */
export class ListComponent {
  columns: Column[];
  filter: Filter = {};

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
