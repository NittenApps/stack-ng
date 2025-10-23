import { Component } from '@angular/core';
import { faCircleExclamation } from '@fortawesome/pro-solid-svg-icons';
import { FieldType, StackFieldConfig } from '@nittenapps/forms';

@Component({
  selector: 'nas-field-tabs',
  templateUrl: './tabs.type.html',
  styleUrl: './tabs.type.scss',
})
export class StackFieldTabs extends FieldType {
  faCircleExclamation = faCircleExclamation;

  isValid(field: StackFieldConfig): boolean {
    if (field.key && field.formControl) {
      return field.formControl.valid;
    }

    return field.fieldGroup ? field.fieldGroup.every((f) => this.isValid(f)) : true;
  }
}
