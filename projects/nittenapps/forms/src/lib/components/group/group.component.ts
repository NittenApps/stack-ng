import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType } from '../../directives';
import { FieldGroupTypeConfig } from '../../directives/field-type.directive';

/** @internal */
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
