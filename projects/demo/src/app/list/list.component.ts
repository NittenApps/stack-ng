import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faQuestion } from '@fortawesome/pro-duotone-svg-icons';
import { ListComponent as NASListComponent, ListToolbarComponent, Column } from '@nittenapps/components';
import { Demo } from '../types/demo';

@Component({
    selector: 'app-list',
    imports: [FaDuotoneIconComponent, ListToolbarComponent, MatButtonModule, MatTooltipModule, NASListComponent],
    templateUrl: './list.component.html'
})
export class ListComponent {
  baseObject: Demo = {};
  faMagnifyingGlass = faMagnifyingGlass;
  faQuestion = faQuestion;

  columns: Column[] = [
    {
      id: 'id',
      title: 'Identificador',
    },
    {
      id: 'code',
      title: 'Código',
    },
    {
      id: 'name',
      title: 'Nombre',
      value: this.getValue,
    },
    {
      id: 'date',
      title: 'Fecha',
      type: 'datetime',
    },
    {
      id: 'status',
      title: 'Estatus',
      field: 'status.name',
    },
    {
      id: 'value',
      title: 'Valor',
      type: 'decimal',
    },
  ];

  getValue(id: string, item?: Demo): string {
    switch (id) {
      case 'name':
        return 'Nombre: ' + item?.name;
      default:
        return '';
    }
  }
}
