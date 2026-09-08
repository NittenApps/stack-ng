import { AfterViewInit, Directive, HostListener, OnDestroy, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

/**
 * Normalizes text input values by trimming leading and trailing whitespace and
 * collapsing consecutive whitespace characters into a single space.
 *
 * The normalized value is applied after the view initializes and whenever the
 * host control loses focus, without emitting a form-control value-change event.
 */
@Directive({
  selector: '[normalizeValue]',
  standalone: true,
})
export class NormalizeValueDirective implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(@Self() private ngControl: NgControl) {}

  /** Normalizes the initial control value after the view has initialized. */
  ngAfterViewInit(): void {
    setTimeout(() => this.setValue(this.normalize(this.ngControl.value)));
  }

  /** Completes the directive's teardown subject when the directive is destroyed. */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('blur')
  /** Normalizes the control value when the host element loses focus. */
  onBlur(): void {
    const value = this.ngControl.control?.value || '';
    !!value && this.setValue(this.normalize(value));
  }

  /** Returns a trimmed value with consecutive whitespace collapsed. */
  private normalize(value: string): string {
    if (!value || typeof value !== 'string') {
      return value;
    }
    return value.trim().replace(/\s+/g, ' ');
  }

  /** Updates the form control without emitting a value-change event. */
  private setValue(value: string) {
    this.ngControl.control?.setValue(value, { emitEvent: false });
  }
}
