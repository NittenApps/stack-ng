import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input-handler';

/**
 * Formats numeric input values and integrates the input with Angular forms.
 * Formatting, validation, and cursor management are delegated to
 * {@link InputHandler}.
 */
@Directive({
  selector: '[numberFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: NumberFormatDirective,
      multi: true,
    },
  ],
})
export class NumberFormatDirective implements ControlValueAccessor {
  private inputHandler: InputHandler;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {
    this.inputHandler = new InputHandler(el.nativeElement, renderer);
  }

  /** Sets the format applied to the input value. */
  @Input('numberFormat')
  public set initialize(format: string) {
    this.inputHandler.setFormat(format);
  }

  /** Sets whether negative values are allowed. */
  @Input('allowNegative')
  public set allowNegative(allow: boolean) {
    this.inputHandler.setAllowNegative(allow);
  }

  /** Delegates keyboard handling to the input handler. */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.inputHandler.handleKeyDown(event);
  }

  /** Delegates click handling to the input handler. */
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    this.inputHandler.handleClick(event);
  }

  /** Delegates input handling to the input handler. */
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.inputHandler.handleInput(event);
  }

  /** Delegates blur handling to the input handler. */
  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    this.inputHandler.handleBlur(event);
  }

  /** Registers the callback used to propagate value changes to Angular forms. */
  registerOnChange(fn: any): void {
    this.inputHandler.setOnModelChange(fn);
  }

  /** Registers the callback used to report that the control was touched. */
  registerOnTouched(fn: any): void {
    this.inputHandler.setOnModelTouched(fn);
  }

  /** Updates the disabled state of the host input element. */
  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  /** Writes a form value to the input element. */
  writeValue(value: string | number): void {
    this.inputHandler.handleWriteValue(value);
  }
}
