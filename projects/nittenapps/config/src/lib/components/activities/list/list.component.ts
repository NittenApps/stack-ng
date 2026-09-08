import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Column, Filter, ListToolbarComponent, ListComponent as StackListComponent } from '@nittenapps/components';

/** Displays and filters the list of activities. */
@Component({
  selector: 'nas-activities-list',
  imports: [FormsModule, ListToolbarComponent, MatInputModule, StackListComponent],
  templateUrl: './list.component.html',
})
export class ListComponent {
  /** Columns displayed in the activities list. */
  columns: Column[];

  /** Filter currently applied to the activities list. */
  filter: Filter = {};

  /** Values entered in the activity filter controls. */
  _filter: { code?: string; name?: string } = {};

  /** Initializes the columns displayed in the activities list. */
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
    this._filter = filter;
  }
}
