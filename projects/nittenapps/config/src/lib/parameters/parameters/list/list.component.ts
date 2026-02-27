import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListComponent as StackListComponent, ListToolbarComponent } from '@nittenapps/components';

@Component({
    selector: 'nas-parameters-list',
    imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
    templateUrl: './list.component.html'
})
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
      filter['code'] = this._filter.code.toUpperCase();
    }
    if (!!this._filter.name) {
      filter['name'] = this._filter.name;
    }
    this.filter = filter;
  }
}
