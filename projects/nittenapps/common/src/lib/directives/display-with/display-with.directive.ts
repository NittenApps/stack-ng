import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Formats values written by Angular into an input element for display.
 *
 * The directive acts as a {@link ControlValueAccessor} and does not alter the
 * value stored by the form control. Provide a formatter with `displayWith`.
 */
@Directive({
  selector: 'input[displayWith]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: DisplayWithDirective,
      multi: true,
    },
  ],
})
export class DisplayWithDirective implements ControlValueAccessor {
  private displayWithFn!: (value: any) => string | null;

  /** Function used to convert a form value into its displayed text. */
  @Input('displayWith')
  set initialize(displayWithFn: (value: any) => string | null) {
    this.displayWithFn = displayWithFn;
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  /** Registers a change callback; display formatting is write-only. */
  registerOnChange(_: any): void {}

  /** Registers a touched callback; display formatting is write-only. */
  registerOnTouched(_: any): void {}

  /** Ignores disabled-state updates because the directive only formats values. */
  setDisabledState(_: boolean): void {}

  /** Writes a formatted value to the host input element. */
  writeValue(value: any): void {
    if (value != null && this.displayWithFn != null) {
      this.renderer.setProperty(this.el.nativeElement, 'value', this.displayWithFn(value));
    } else {
      this.renderer.setProperty(this.el.nativeElement, 'value', value || null);
    }
  }
}
