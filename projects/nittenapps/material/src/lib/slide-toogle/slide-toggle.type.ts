import { ChangeDetectionStrategy, Component, Type, ViewChild } from '@angular/core';
import { FieldType, StackFieldProps } from '../form-field';
import { FieldTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';

interface ToggleProps extends StackFieldProps {
  labelPosition?: 'before' | 'after';
}

export interface StackToggleFieldConfig extends StackFieldConfig<ToggleProps> {
  type: 'toggle' | Type<StackFieldToggle>;
}

@Component({
  selector: 'nas-field-mat-slide-toggle',
  templateUrl: './slide-toggle.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
/**
 * Field type based on `mat-slide-toggle` for boolean values.
 * It is used when the form needs to enable or disable options.
 */
export class StackFieldToggle extends FieldType<FieldTypeConfig<ToggleProps>> {
  @ViewChild(MatSlideToggle, { static: true }) slideToggle!: MatSlideToggle;

  override defaultOptions = {
    props: {
      hideFieldUnderline: true,
      floatLabel: 'always' as const,
      hideLabel: true,
    },
  };

  override onContainerClick(event: MouseEvent): void {
    this.slideToggle.focus();
    super.onContainerClick(event);
  }
}
