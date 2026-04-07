import { Directive, Input, OnChanges, TemplateRef } from '@angular/core';

/** Directive that registers an inline template to reuse it as a field type. */
@Directive({
    selector: '[nasFormTemplate]',
    standalone: false
})
export class StackFormTemplate implements OnChanges {
  @Input('nasFormTemplate') name?: string;

  constructor(public ref: TemplateRef<any>) {}

  ngOnChanges() {
    this.name = this.name || 'nas-form-group';
  }
}
