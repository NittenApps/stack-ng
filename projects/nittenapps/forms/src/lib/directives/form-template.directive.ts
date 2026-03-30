import { Directive, Input, OnChanges, TemplateRef } from '@angular/core';

/** Directiva que registra una plantilla inline para reutilizarla como tipo de campo. */
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
