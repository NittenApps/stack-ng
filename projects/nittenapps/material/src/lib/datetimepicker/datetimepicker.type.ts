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
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatCalendarView, MatDatetimepickerComponent } from '@mat-datetimepicker/core';
import { FieldTypeConfig, StackFieldConfig, StackFormsConfig, ɵobserve as observe } from '@nittenapps/forms';
import { FieldType, StackFieldProps } from '../form-field';

type MatDatetimepickerType = 'date' | 'time' | 'month' | 'year' | 'datetime';

interface DatetimepickerProps extends StackFieldProps {
  datetimepickerOptions?: Partial<{
    type: MatDatetimepickerType;
    touchUi: boolean;
    opened: boolean;
    disabled: boolean;
    startView: MatCalendarView;
    togglePosition: 'suffix' | 'prefix';
    filter: (date: any | null) => boolean;
    min: any;
    max: any;
    dateInput: (field: FieldTypeConfig<DatetimepickerProps>, event: any) => void;
    dateChange: (field: FieldTypeConfig<DatetimepickerProps>, event: any) => void;

    monthSelected: (
      field: FieldTypeConfig<DatetimepickerProps>,
      event: any,
      picker: MatDatetimepickerComponent<any>
    ) => void;
    yearSelected: (
      field: FieldTypeConfig<DatetimepickerProps>,
      event: any,
      picker: MatDatetimepickerComponent<any>
    ) => void;

    dateClass: MatCalendarCellClassFunction<any>;
    panelClass: string | string[];
    startAt: any | null;
  }>;
}

export interface StackDatetimepickerFieldConfig extends StackFieldConfig<FieldTypeConfig<DatetimepickerProps>> {
  type: 'datetimepicker' | Type<StackFieldDatetimepicker>;
}

@Component({
  selector: 'nas-field-mat-datetimepicker',
  templateUrl: './datetimepicker.type.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
/**
 * Field type for date and time using `@mat-datetimepicker`.
 * It is used when the form needs to capture date, time, or both with a single configuration.
 */
export class StackFieldDatetimepicker
  extends FieldType<FieldTypeConfig<DatetimepickerProps>>
  implements AfterViewInit, OnDestroy
{
  //@ViewChild('datetimepickerToggle', { static: true }) datetimepickerToggle!: TemplateRef<any>;

  override defaultOptions: { props: DatetimepickerProps } = {
    props: {
      datetimepickerOptions: {
        type: 'datetime',
        touchUi: true,
        startView: 'month' as const,
        togglePosition: 'suffix' as const,
        disabled: false,
        opened: false,
        dateInput: () => {},
        dateChange: () => {},
        monthSelected: () => {},
        yearSelected: () => {},
      },
    },
  };

  private fieldErrorsObserver!: ReturnType<typeof observe>;

  constructor(private config: StackFormsConfig, private cdRef: ChangeDetectorRef) {
    super();
  }

  ngAfterViewInit(): void {
    //(this.props as any)[this.props.datetimepickerOptions?.togglePosition!] = this.datetimepickerToggle;
    observe<boolean>(this.field, ['props', 'datetimepickerOptions', 'opened'], () => {
      this.cdRef.detectChanges();
    });

    // temporary fix for https://github.com/angular/components/issues/16761
    if (this.config.getValidatorMessage('matDatetimepickerParse')) {
      this.fieldErrorsObserver = observe<any>(this.field, ['formControl', 'errors'], ({ currentValue }) => {
        if (currentValue && currentValue.required && currentValue.matDatepickerParse) {
          const errors = Object.keys(currentValue)
            .sort((prop) => (prop === 'matDatetimepickerParse' ? -1 : 0))
            .reduce((errors, prop) => ({ ...errors, [prop]: currentValue[prop] }), {});

          this.fieldErrorsObserver?.setValue(errors);
        }
      });
    }

    this.formControl.updateValueAndValidity({ emitEvent: false });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.fieldErrorsObserver?.unsubscribe();
  }

  detectChanges(): void {
    this.options?.detectChanges?.(this.field);
  }
}
