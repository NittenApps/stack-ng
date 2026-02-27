import { ComponentType } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import { MatCalendarCellClassFunction, MatDatepicker } from '@angular/material/datepicker';
import { FieldTypeConfig, StackFieldConfig, StackFormsConfig, ɵobserve as observe } from '@nittenapps/forms';
import { FieldType, StackFieldProps } from '../form-field';

interface DatepickerProps extends StackFieldProps {
  datepickerOptions?: Partial<{
    touchUi: boolean;
    opened: boolean;
    disabled: boolean;
    startView: 'month' | 'year' | 'multi-year';
    togglePosition: 'suffix' | 'prefix';
    calendarHeaderComponent: ComponentType<any>;
    filter: (date: any | null) => boolean;
    min: any;
    max: any;
    dateInput: (field: FieldTypeConfig<DatepickerProps>, event: any) => void;
    dateChange: (field: FieldTypeConfig<DatepickerProps>, event: any) => void;

    monthSelected: (field: FieldTypeConfig<DatepickerProps>, event: any, picker: MatDatepicker<any>) => void;
    yearSelected: (field: FieldTypeConfig<DatepickerProps>, event: any, picker: MatDatepicker<any>) => void;

    dateClass: MatCalendarCellClassFunction<any>;
    panelClass: string | string[];
    startAt: any | null;
  }>;
}

export interface StackDatepickerFieldConfig extends StackFieldConfig<FieldTypeConfig<DatepickerProps>> {
  type: 'datepicker' | Type<StackFieldDatepicker>;
}

@Component({
  selector: 'nas-field-mat-datepicker',
  templateUrl: './datepicker.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StackFieldDatepicker
  extends FieldType<FieldTypeConfig<DatepickerProps>>
  implements AfterViewInit, OnDestroy
{
  @ViewChild('datepickerToggle', { static: true })
  datepickerToggle!: TemplateRef<any>;

  override defaultOptions = {
    props: {
      datepickerOptions: {
        startView: 'month' as const,
        togglePosition: 'suffix' as const,
        disabled: false,
        opened: false,
        dateInput: () => {},
        dateChange: () => {},
        monthSelected: () => {},
        yearSelected: () => {},
        filter: () => true,
        dateClass: () => '',
      },
    },
  };

  private fieldErrorsObserver!: ReturnType<typeof observe>;

  constructor(private config: StackFormsConfig, private cdRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    (this.props as any)[this.props.datepickerOptions?.togglePosition!] = this.datepickerToggle;
    observe<boolean>(this.field, ['props', 'datepickerOptions', 'opened'], () => {
      this.cdRef.detectChanges();
    });

    // temporary fix for https://github.com/angular/components/issues/16761
    if (this.config.getValidatorMessage('matDatepickerParse')) {
      this.fieldErrorsObserver = observe<any>(this.field, ['formControl', 'errors'], ({ currentValue }) => {
        if (currentValue && currentValue.required && currentValue.matDatepickerParse) {
          const errors = Object.keys(currentValue)
            .sort((prop) => (prop === 'matDatepickerParse' ? -1 : 0))
            .reduce((errors, prop) => ({ ...errors, [prop]: currentValue[prop] }), {});

          this.fieldErrorsObserver?.setValue(errors);
        }
      });
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.fieldErrorsObserver?.unsubscribe();
  }

  detectChanges(): void {
    this.options?.detectChanges?.(this.field);
  }
}
