import { AfterViewInit, Directive, HostListener, OnDestroy, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Directive({
  selector: '[normalizeValue]',
  standalone: true,
})
/** Trims spaces and collapses repeated separators in text controls. */
export class NormalizeValueDirective implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(@Self() private ngControl: NgControl) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.setValue(this.normalize(this.ngControl.value)));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('blur')
  onBlur(): void {
    const value = this.ngControl.control?.value || '';
    !!value && this.setValue(this.normalize(value));
  }

  private normalize(value: string): string {
    if (!value || typeof value !== 'string') {
      return value;
    }
    return value.trim().replace(/\s+/g, ' ');
  }

  private setValue(value: string) {
    this.ngControl.control?.setValue(value, { emitEvent: false });
  }
}
