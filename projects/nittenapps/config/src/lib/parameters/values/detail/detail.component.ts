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

@Component({
    selector: 'nas-catalogs-detail',
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
    templateUrl: './detail.component.html'
})
/** Detail component for parameters, responsible for displaying their information and allowing the editing of their attributes. */
export class DetailComponent extends BaseDetailComponent<any> {
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
              readonly: true,
            },
          },
          {
            key: 'name',
            type: 'input',
            props: {
              label: 'Nombre',
              readonly: true,
            },
          },
          {
            key: 'description',
            type: 'input',
            props: {
              label: 'Descripción',
              readonly: true,
            },
          },
          {
            key: 'stringValue',
            type: 'input',
            props: {
              label: 'Valor',
            },
            expressions: {
              hide: 'model.type !== "AN"',
            },
          },
          {
            key: 'numberValue',
            type: 'number',
            props: {
              label: 'Valor',
            },
            expressions: {
              hide: 'model.type !== "NM"',
            },
          },
          {
            key: 'booleanValue',
            type: 'toggle',
            props: {
              label: 'Valor',
            },
            expressions: {
              hide: 'model.type !== "BL"',
            },
          },
        ],
      },
    ];
  }

  protected override getActivity(): string {
    return 'parametersValue';
  }
}
