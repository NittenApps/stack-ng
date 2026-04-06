import { Component } from '@angular/core';
import { faCaretLeft, faCaretRight, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FieldArrayType, FieldArrayTypeConfig, StackFieldConfig } from '@nittenapps/forms';
import { StackFieldProps } from '../form-field';

interface LogbookProps extends StackFieldProps {
  onlyOne?: boolean;
}

export interface LogbookConfig extends StackFieldConfig<LogbookProps> {}

@Component({
  selector: 'nas-mat-logbook',
  templateUrl: './logbook.type.html',
  styleUrl: './logbook.type.scss',
  standalone: false,
})
export class StackMatLogbook extends FieldArrayType<FieldArrayTypeConfig<LogbookProps>> {
  readonly faCaretLeft = faCaretLeft;
  readonly faCaretRight = faCaretRight;
  readonly faPlus = faPlus;

  current: number = 0;

  get length(): number {
    return this.model?.length || 0;
  }

  get readonly(): boolean {
    return !!this.props.readonly || !this.model || this.field.model.length < 1;
  }

  override defaultOptions = {
    props: {
      onlyOne: false,
    },
  };

  override add(): void {
    super.add(undefined, { position: this.length });
    this.current = this.length - 1;
  }

  override onPopulate(field: FieldArrayTypeConfig<LogbookProps>): void {
    field.fieldArray = {
      fieldGroup: [
        {
          type: 'editor',
          key: 'textValue',
          props: {
            readonly: this.readonly,
          },
        },
      ],
    };
    super.onPopulate(field);
  }

  next(): void {
    this.current++;
  }

  prev(): void {
    this.current--;
  }
}
