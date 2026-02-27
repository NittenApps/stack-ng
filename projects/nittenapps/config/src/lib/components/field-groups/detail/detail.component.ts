import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { Data } from '@angular/router';
import { ListBody } from '@nittenapps/api';
import { Field, FieldGroup } from '@nittenapps/common';
import { BaseDetailComponent, DetailToolbarComponent } from '@nittenapps/components';
import { StackFieldConfig, StackFormsModule } from '@nittenapps/forms';
import {
  StackMatInputModule,
  StackMatSelectModule,
  StackMatTabsModule,
  StackMatToggleModule,
} from '@nittenapps/material';
import { PickListModule } from 'primeng/picklist';

@Component({
    selector: 'nas-field-groups-detail',
    imports: [
        CommonModule,
        DetailToolbarComponent,
        MatTabsModule,
        PickListModule,
        ReactiveFormsModule,
        StackFormsModule,
        StackMatInputModule,
        StackMatSelectModule,
        StackMatTabsModule,
        StackMatToggleModule,
    ],
    templateUrl: './detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailComponent extends BaseDetailComponent<FieldGroup> {
  definitionFields: StackFieldConfig[];
  sourceFields: Field[] = [];
  targetFields: Field[] = [];

  constructor() {
    super();

    this.definitionFields = [
      {
        fieldGroupClassName: 'row row-cols-1 row-cols-md-4',
        fieldGroup: [
          {
            key: 'definition.hide',
            type: 'input',
            props: {
              label: 'Oculto',
            },
          },
          {
            key: 'definition.base',
            type: 'input',
            props: {
              label: 'Base',
            },
          },
        ],
      },
    ];
  }

  markDirty(): void {
    this.form.markAsDirty();
  }

  trackBy(_index: number, item: Field): any {
    return item.id;
  }

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
        ],
      },
    ];
  }

  protected override getActivity(): string {
    return 'configFieldGroups';
  }

  protected override initModel(data: Data): void {
    super.initModel(data);

    this.activityService.get('getFields', {}).subscribe({
      next: (fields) => {
        this.targetFields = this.model.fields || [];

        const ids = this.targetFields.map((field) => field.id);
        this.sourceFields = (fields.body as ListBody<Field>).items.filter((item) => !ids.includes(item.id));
      },
    });
  }

  protected override prepareValue(): any {
    const value = super.prepareValue();
    value.fields = this.targetFields;
    return value;
  }
}
