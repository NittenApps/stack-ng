import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FieldType } from '../../directives';

/** @internal */
@Component({
    selector: 'nas-form-template',
    template: `<div [innerHtml]="template"></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StackFormsTemplateType extends FieldType {
  get template() {
    if (this.field && this.field.template !== this.innerHtml.template) {
      this.innerHtml = {
        template: this.field.template,
        content: this.field.template,
      };
    }

    return this.innerHtml.content;
  }

  private innerHtml: { content?: SafeHtml; template?: string } = {};

  constructor(private sanitizer: DomSanitizer) {
    super();
  }
}
