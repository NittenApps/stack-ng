import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType } from '../../directives';
import { FieldGroupTypeConfig } from '../../directives/field-type.directive';

/** Base component that renders nested field groups. */
@Component({
    selector: 'nas-form-group',
    template: `
    @for (f of field.fieldGroup; track f) {
    <nas-field [field]="f" />
    }
    <ng-content />
  `,
    host: {
        '[class]': 'field.fieldGroupClassName || ""',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StackFormGroup extends FieldType<FieldGroupTypeConfig> {}
