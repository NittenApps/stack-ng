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

/**
 * Displays and edits the configuration details of a module, including its
 * definition fields and associated activities.
 */
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent extends BaseDetailComponent<Module> {
  /** Fields used to edit the module definition. */
  definitionFields: StackFieldConfig[];
  /** Activities available for selection in the source list. */
  sourceActivities: Activity[] = [];
  /** Activities currently associated with the module. */
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

  /** Returns the stable identifier used to track an activity in the view. */
  trackBy(_index: number, item: Activity): any {
    return item.id;
  }

  /** Builds the fields used to edit the module's general configuration. */
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

  /** Returns the activity key used to load module configuration data. */
  protected override getActivity(): string {
    return 'configModules';
  }

  /** Loads the module activities and separates selected from available items. */
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

  /** Adds the selected activities to the value submitted by the form. */
  protected override prepareValue(): any {
    const value = super.prepareValue();
    value.activities = this.targetActivities;
    return value;
  }
}
