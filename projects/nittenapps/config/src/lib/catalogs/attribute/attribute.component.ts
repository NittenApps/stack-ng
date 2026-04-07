import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ConfigService, NAS_API_CONFIG } from '@nittenapps/api';
import { Catalog } from '@nittenapps/common';
import { StackFieldConfig, StackFormOptions, StackFormsModule } from '@nittenapps/forms';
import { map } from 'rxjs';

@Component({
    selector: 'nas-attribute',
    imports: [MatButtonModule, MatDialogModule, ReactiveFormsModule, StackFormsModule],
    templateUrl: './attribute.component.html'
})
/** Component responsible for opening a modal to create or edit a catalog attribute. */

export class AttributeComponent {
  fields!: StackFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: any = {};
  options: StackFormOptions = {};

  constructor() {
    const data = inject(MAT_DIALOG_DATA);
    const configService = new ConfigService(inject(NAS_API_CONFIG), inject(HttpClient));

    setTimeout(() => {
      this.fields = [
        {
          fieldGroupClassName: 'row row-cols-1 row-cols-md-3',
          fieldGroup: [
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
                  { value: 'BL', label: 'Booleano' },
                  { value: 'CT', label: 'Catálogo' },
                ],
              },
            },
            {
              key: 'code',
              type: 'uppercase',
              props: {
                label: 'Código',
                required: true,
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
              key: 'required',
              type: 'toggle',
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
                label: 'Múltiple',
              },
              expressions: {
                hide: 'model.type !== "CT"',
              },
            },
            {
              key: 'definition.catalog',
              type: 'select',
              props: {
                label: 'Catálogo',
                options: configService
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

      this.model = data;
    });
  }
}
