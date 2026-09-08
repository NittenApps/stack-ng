import { BooleanInput } from '@angular/cdk/coercion';
import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Forces the value of a bound Angular form control to lowercase when enabled.
 *
 * This directive is intended for text inputs managed through `NgControl`. When
 * active, it adds the `lowercase` CSS class to the host element and normalizes
 * the current value on initialization and whenever the host element loses focus.
 */
@Directive({
  selector: '[lowercase]',
  standalone: true,
})
export class LowercaseDirective implements AfterViewInit, OnDestroy {
  @Input()
  set lowercase(apply: BooleanInput) {
    this._apply = !(apply === false);
    if (this._apply) {
      this.renderer.addClass(this.element.nativeElement, 'lowercase');
    }
  }

  private _apply = true;
  private destroy$ = new Subject<void>();

  constructor(
    private element: ElementRef,
    @Self() private ngControl: NgControl,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    if (!this._apply) {
      return;
    }

    setTimeout(() => this.setValue(this.ngControl.value?.toLowerCase()));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('blur')
  onBlur(): void {
    if (!this._apply) {
      return;
    }

    const value = this.ngControl.value;
    !!value && this.setValue(value?.toLowerCase());
  }

  private setValue(value: string) {
    this.ngControl.control?.setValue(value, { emitEvent: false });
  }
}
