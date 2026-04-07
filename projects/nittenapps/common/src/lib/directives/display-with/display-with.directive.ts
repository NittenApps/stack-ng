import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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
/**
 * Directive that displays a custom representation of the control value in the input.
 *
 * It allows visually transforming the value mainly used to render catalog values
 * without modifying the real value
 */
export class DisplayWithDirective implements ControlValueAccessor {
  private displayWithFn!: (value: any) => string | null;

  @Input('displayWith')
  set initialize(displayWithFn: (value: any) => string | null) {
    this.displayWithFn = displayWithFn;
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  registerOnChange(fn: any): void {}

  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {}

  writeValue(value: any): void {
    if (value != null && this.displayWithFn != null) {
      this.renderer.setProperty(this.el.nativeElement, 'value', this.displayWithFn(value));
    } else {
      this.renderer.setProperty(this.el.nativeElement, 'value', value || null);
    }
  }
}
