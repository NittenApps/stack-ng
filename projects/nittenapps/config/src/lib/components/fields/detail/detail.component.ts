import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Catalog, CommonModule, Field, FieldGroup } from '@nittenapps/common';
import { BaseDetailComponent, DetailToolbarComponent } from '@nittenapps/components';
import { StackFieldConfig, StackFormsModule } from '@nittenapps/forms';
import {
  StackMatAutocompleteModule,
  StackMatInputModule,
  StackMatSelectModule,
  StackMatTabsModule,
  StackMatToggleModule,
} from '@nittenapps/material';
import { map } from 'rxjs';

@Component({
  selector: 'nas-field-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    DetailToolbarComponent,
    ReactiveFormsModule,
    StackFormsModule,
    StackMatAutocompleteModule,
    StackMatInputModule,
    StackMatSelectModule,
    StackMatTabsModule,
    StackMatToggleModule,
  ],
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent extends BaseDetailComponent<Field> {
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
              'props.readonly': 'model.id',
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
            key: 'active',
            type: 'toggle',
            props: {
              label: 'Activo',
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
                { value: 'DO', label: 'Fecha' },
                { value: 'DT', label: 'Fecha y Hora' },
                { value: 'TX', label: 'Texto' },
                { value: 'BL', label: 'Booleano' },
                { value: 'CT', label: 'Catálogo' },
                { value: 'AC', label: 'Autocompletar' },
                { value: 'LB', label: 'Bitácora' },
                { value: 'DC', label: 'Documento' },
              ],
            },
          },
        ],
      },
      {
        type: 'tabs',
        fieldGroup: [
          {
            fieldGroupClassName: 'row row-cols-1 row-cols-md-4',
            props: { label: 'Definición' },
            fieldGroup: [
              {
                key: 'definition.required',
                type: 'input',
                props: {
                  label: 'Requerido',
                },
                expressions: {
                  hide: 'model.type === "BL"',
                },
              },
              {
                key: 'definition.multiple',
                type: 'toggle',
                props: {
                  label: 'Mútiple',
                },
                expressions: {
                  hide: '!["CT","DC"].includes(model.type)',
                },
              },
              {
                key: 'definition.hide',
                type: 'input',
                props: {
                  label: 'Oculto',
                },
              },
              {
                key: 'definition.readonly',
                type: 'input',
                props: {
                  label: 'Solo lectura',
                },
              },
              {
                key: 'definition.format',
                type: 'input',
                props: {
                  label: 'Formato',
                },
              },
              {
                key: 'definition.pattern',
                type: 'input',
                props: {
                  label: 'Validación',
                },
                expressions: {
                  hide: '!["AN","TX"].includes(model.type)',
                },
              },
              {
                key: 'definition.minLength',
                type: 'number',
                props: {
                  label: 'Longitud mínima',
                },
                expressions: {
                  hide: '!["AN","TX"].includes(model.type)',
                },
              },
              {
                key: 'definition.maxLength',
                type: 'number',
                props: {
                  label: 'Longitud máxima',
                },
                expressions: {
                  hide: '!["AN","TX"].includes(model.type)',
                },
              },
              {
                key: 'definition.min',
                type: 'number',
                props: {
                  label: 'Valor mínimo',
                  format: 'decimal',
                },
                expressions: {
                  hide: '!["NM"].includes(model.type)',
                },
              },
              {
                key: 'definition.max',
                type: 'number',
                props: {
                  label: 'Valor máximo',
                  format: 'decimal',
                },
                expressions: {
                  hide: '!["NM"].includes(model.type)',
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
                  hide: '!["AC","CT"].includes(model.type)',
                  'props.required': '["AC","CT"].includes(model.type)',
                },
              },
              {
                key: 'definition.reference',
                type: 'input',
                props: {
                  label: 'Referencia',
                },
                expressions: {
                  hide: '!["AC","CT"].includes(model.type)',
                },
              },
            ],
          },
        ],
      },
    ];
  }

  protected override getActivity(): string {
    return 'configFields';
  }
}
