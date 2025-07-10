import { DATE_PIPE_DEFAULT_OPTIONS, DatePipeConfig, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, LOCALE_ID, Optional, Type } from '@angular/core';
import { FieldTypeConfig, StackFieldConfig, StackFieldProps as CoreStackFieldProps } from '@nittenapps/forms';
import { FieldType } from '../form-field';

export interface StackFieldProps extends CoreStackFieldProps {
  allowNegative?: boolean;
  format?: 'uppercase' | 'lowercase' | 'integer' | 'decimal' | 'percent' | 'date' | 'datetime' | string;
}

export interface StackInputFieldConfig extends StackFieldConfig<StackFieldProps> {
  type: 'input' | Type<StackFieldInput>;
}

// TODO: use datetime formats configuration
@Component({
  selector: 'nas-field-mat-input',
  templateUrl: './input.type.html',
  styleUrl: './input.type.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackFieldInput extends FieldType<FieldTypeConfig<StackFieldProps>> {
  private static _SELF: StackFieldInput;

  get allowNegative(): boolean {
    return !!this.props.allowNegative;
  }

  get type(): string {
    return this.props.type || 'text';
  }

  get format(): string {
    switch (this.type) {
      case 'number':
        switch (this.props.format) {
          case 'decimal':
            return 'separator.2';
          case 'integer':
            return 'separator.0';
          default:
            return this.props.format || 'separator.0';
        }
      case 'date':
        switch (this.props.format) {
          case 'date':
            return 'dd/MM/yyyy';
          case 'datetime':
            return 'dd/MM/yyyy HH:mm';
          default:
            return this.props.format || 'dd/MM/yyyy HH:mm';
        }
      case 'percent':
        return this.props.format || 'percent.2';
      default:
        return this.props.format || '';
    }
  }

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(DATE_PIPE_DEFAULT_OPTIONS) @Optional() private datePipeOptions?: DatePipeConfig | null
  ) {
    super();

    StackFieldInput._SELF = this;
  }

  formatDatetime(value: any): string {
    return formatDate(
      value,
      StackFieldInput._SELF.format,
      StackFieldInput._SELF.locale,
      StackFieldInput._SELF.datePipeOptions?.timezone
    );
  }

  formatCatalog(value: any): string {
    if (Array.isArray(value)) {
      return value.map((v) => (v.code ? v.code + ' - ' : '') + (v.name || '')).join(', ');
    }
    return (value.code ? value.code + ' - ' : '') + (value.name || '');
  }
}
