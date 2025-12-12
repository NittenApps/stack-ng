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
