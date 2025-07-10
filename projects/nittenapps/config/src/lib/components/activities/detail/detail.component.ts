import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { Data } from '@angular/router';
import { ListBody } from '@nittenapps/api';
import { Activity, FieldGroup } from '@nittenapps/common';
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
  selector: 'nas-activities-detail',
  standalone: true,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent extends BaseDetailComponent<Activity> {
  definitionFields: StackFieldConfig[];
  sourceFieldGroups: FieldGroup[] = [];
  targetFieldGroups: FieldGroup[] = [];

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
        ],
      },
    ];
  }

  trackBy(_index: number, item: FieldGroup): any {
    return item.id;
  }

  protected override configFields(_fieldGroups: FieldGroup[]): StackFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row row-cols-1 row-cols-md-4',
        fieldGroup: [
          {
            key: 'code',
            type: 'input',
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
    return 'configActivities';
  }

  protected override initModel(data: Data): void {
    super.initModel(data);

    this.activityService.get('getFieldGroups', {}).subscribe({
      next: (fieldGroups) => {
        this.targetFieldGroups = this.model.fieldGroups || [];

        const ids = this.targetFieldGroups.map((fieldGroup) => fieldGroup.id);
        this.sourceFieldGroups = (fieldGroups.body as ListBody<FieldGroup>).items.filter(
          (item) => !ids.includes(item.id)
        );
      },
    });
  }

  protected override prepareValue(): any {
    const value = super.prepareValue();
    value.fieldGroups = this.targetFieldGroups;
    return value;
  }
}
