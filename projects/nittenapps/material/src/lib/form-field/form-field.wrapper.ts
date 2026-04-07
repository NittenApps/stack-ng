import { FocusMonitor } from '@angular/cdk/a11y';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { FloatLabelType, MatFormField, MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import {
  StackFieldConfig,
  StackFieldProps as CoreStackFieldProps,
  FieldWrapper,
  ɵdefineHiddenProp as defineHiddenProp,
} from '@nittenapps/forms';

interface MatStackFieldConfig extends StackFieldConfig<StackFieldProps> {
  _formField?: StackFormsWrapperFormField;
}

export interface StackFieldProps extends CoreStackFieldProps {
  prefix?: TemplateRef<any>;
  suffix?: TemplateRef<any>;
  textPrefix?: TemplateRef<any>;
  textSuffix?: TemplateRef<any>;
  hideLabel?: boolean;
  hideRequiredMarker?: boolean;
  hideFieldUnderline?: boolean;
  floatLabel?: FloatLabelType;
  appearance?: MatFormFieldAppearance;
  subscriptSizing?: SubscriptSizing;
  color?: ThemePalette;
  hintStart?: TemplateRef<any> | string;
  hintEnd?: TemplateRef<any> | string;
}

@Component({
  selector: 'nas-form-wrapper-mat-form-field',
  templateUrl: './form-field.wrapper.html',
  styleUrl: './form-field.wrapper.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
/**
 * Wrapper that wraps a Stack Forms field inside `mat-form-field`.
 * It is used to unify label, hints, errors, prefixes, and suffixes with the Angular Material style.
 */
export class StackFormsWrapperFormField
  extends FieldWrapper<MatStackFieldConfig>
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild(MatFormField, { static: true }) formField!: MatFormField;

  constructor(private renderer: Renderer2, private elementRef: ElementRef, private focusMonitor: FocusMonitor) {
    super();
  }

  ngOnInit() {
    defineHiddenProp(this.field, '_formField', this.formField);
    this.focusMonitor.monitor(this.elementRef, true).subscribe((origin) => {
      if (!origin && this.field.focus) {
        this.field.focus = false;
      }
    });
  }

  ngAfterViewInit() {
    // temporary fix for https://github.com/angular/material2/issues/7891
    if (this.formField.appearance !== 'outline' && this.props['hideFieldUnderline'] === true) {
      const underlineElement = this.formField._elementRef.nativeElement.querySelector('.mat-form-field-underline');
      underlineElement && this.renderer.removeChild(underlineElement.parentNode, underlineElement);
    }
  }

  ngOnDestroy() {
    delete this.field._formField;
    this.focusMonitor.stopMonitoring(this.elementRef);
  }
}
