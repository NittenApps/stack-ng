import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { Data } from '@angular/router';
import { ListBody } from '@nittenapps/api';
import { Activity, FieldGroup, Module } from '@nittenapps/common';
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
/** Detail component for a module that belongs to configuration, responsible for displaying its information and allowing editing. */
export class DetailComponent extends BaseDetailComponent<Module> {
  definitionFields: StackFieldConfig[];
  sourceActivities: Activity[] = [];
  targetActivities: Activity[] = [];

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

  trackBy(_index: number, item: Activity): any {
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
    return 'configModules';
  }

  protected override initModel(data: Data): void {
    super.initModel(data);

    this.activityService.get('getActivities', {}).subscribe({
      next: (activities) => {
        this.targetActivities = this.model.activities || [];

        const ids = this.targetActivities.map((fieldGroup) => fieldGroup.id);
        this.sourceActivities = (activities.body as ListBody<Activity>).items.filter((item) => !ids.includes(item.id));
      },
    });
  }

  protected override prepareValue(): any {
    const value = super.prepareValue();
    value.activities = this.targetActivities;
    return value;
  }
}
