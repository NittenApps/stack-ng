import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputHandler } from './input-handler';

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
/** Aplica una máscara de formato numérico al input manteniendo un valor compatible con formularios. */
export class NumberFormatDirective implements ControlValueAccessor {
  private inputHandler: InputHandler;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.inputHandler = new InputHandler(el.nativeElement, renderer);
  }

  @Input('numberFormat')
  public set initialize(format: string) {
    this.inputHandler.setFormat(format);
  }

  @Input('allowNegative')
  public set allowNegative(allow: boolean) {
    this.inputHandler.setAllowNegative(allow);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.inputHandler.handleKeyDown(event);
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    this.inputHandler.handleClick(event);
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    this.inputHandler.handleInput(event);
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    this.inputHandler.handleBlur(event);
  }

  registerOnChange(fn: any): void {
    this.inputHandler.setOnModelChange(fn);
  }

  registerOnTouched(fn: any): void {
    this.inputHandler.setOnModelTouched(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  writeValue(value: string | number): void {
    this.inputHandler.handleWriteValue(value);
  }
}
