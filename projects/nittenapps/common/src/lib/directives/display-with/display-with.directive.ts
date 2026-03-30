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
 * Directiva que muestra en el input una representación personalizada del valor del control.
 *
 * Permite transformar visualmente el valor usado principalmente para renderizar valores
 * de catalogos sin modificar el valor real
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
