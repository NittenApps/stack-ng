import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Catalog, FieldGroup } from '@nittenapps/common';
import { BaseDetailComponent, DetailToolbarComponent } from '@nittenapps/components';
import { StackFieldConfig, StackFormsModule } from '@nittenapps/forms';
import {
  StackMatInputModule,
  StackMatSelectModule,
  StackMatTableModule,
  StackMatToggleModule,
} from '@nittenapps/material';
import { map } from 'rxjs';

@Component({
  selector: 'nas-catalogs-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    DetailToolbarComponent,
    ReactiveFormsModule,
    StackFormsModule,
    StackMatInputModule,
    StackMatSelectModule,
    StackMatTableModule,
    StackMatToggleModule,
  ],
  templateUrl: './detail.component.html',
})
export class DetailComponent extends BaseDetailComponent<Catalog> {
  protected override configFields(_fieldGroups: FieldGroup[]): StackFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row row-cols-1 row-cols-md-4',
        fieldGroup: [
          {
            key: 'code',
            type: 'uppercase',
            props: {
              label: 'Código',
              required: true,
            },
            expressions: {
              'props.readonly': '!model.isNew',
            },
          },
          {
            key: 'name',
            type: 'input',
            props: {
              label: 'Nombre',
              required: true,
            },
          },
          {
            key: 'description',
            type: 'input',
            props: {
              label: 'Descripción',
            },
          },
          {
            key: 'type',
            type: 'select',
            props: {
              label: 'Tipo',
              required: true,
              options: [
                { value: 'AN', label: 'Alfanumérico' },
                { value: 'NM', label: 'Numérico' },
                /*{ value: 'DO', label: 'Fecha' },
                { value: 'DT', label: 'Fecha y Hora' },*/
                { value: 'BL', label: 'Booleano' },
                //{ value: 'CT', label: 'Catálogo' },
              ],
            },
          },
          {
            key: 'definition.multiple',
            type: 'toggle',
            props: {
              label: 'Múltiple',
            },
            expressions: {
              hide: 'model.type !== "CTXXX"',
            },
          },
          {
            key: 'definition.catalog',
            type: 'select',
            props: {
              label: 'Catálogo',
              options: this.configService
                .getCatalogs()
                .pipe(
                  map((items: Catalog[]) =>
                    items.map((catalog) => ({ value: catalog.code, label: `${catalog.code} - ${catalog.name}` }))
                  )
                ),
            },
            expressions: {
              hide: 'model.type !== "CT"',
              'props.required': 'model.type === "CT"',
            },
          },
        ],
      },
    ];
  }

  protected override getActivity(): string {
    return 'parameters';
  }
}
