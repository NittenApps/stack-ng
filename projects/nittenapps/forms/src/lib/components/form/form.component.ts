import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DoCheck,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { filter, of, Subscription, switchMap, take } from 'rxjs';
import { StackFormTemplate } from '../../directives';
import { StackFieldTemplates, StackFormBuilder, StackFormsConfig } from '../../services';
import { StackFieldConfig, StackFieldConfigCache, StackFormOptions } from '../../types';
import { clone, hasKey, isNoopNgZone, isSignalRequired, observeDeep } from '../../utils';
import { clearControl } from '../../extensions/field-form/utils';

/**
 * The main container of the form, takes care of managing the form state. Delegates
 * the rendering of the fields to each <nas-field> component.
 */
@Component({
    selector: 'nas-form',
    template: '<nas-field [field]="field" />',
    providers: [StackFormBuilder, StackFieldTemplates],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class StackForm implements DoCheck, OnChanges, OnDestroy {
  field: StackFieldConfigCache = { type: 'nas-form-group' };

  /** The field configurations for building the form. */
  @Input()
  set fields(fieldGroup: StackFieldConfig[]) {
    this.setField({ fieldGroup });
  }

  get fields(): StackFieldConfig[] {
    return this.field.fieldGroup!;
  }

  /** The form instance which allows to track model value and validation status */
  @Input()
  set form(form: FormGroup | FormArray) {
    this.field.form = form;
  }

  get form(): FormGroup | FormArray {
    return this.field.form!;
  }

  /** The model to be represented by the form. */
  @Input()
  set model(model: any) {
    if (this.config.extras.immutable && this._modelChangeValue === model) {
      return;
    }

    this.setField({ model });
  }

  get model(): any {
    return this.field.model;
  }

  /** Options for the form. */
  @Input()
  set options(options: StackFormOptions) {
    this.setField({ options });
  }

  get options(): StackFormOptions {
    return this.field.options!;
  }

  /** Event that is emitted when the model value is changed */
  @Output() modelChange = new EventEmitter<any>();

  @ContentChildren(StackFormTemplate) set templates(templates: QueryList<StackFormTemplate>) {
    this.fieldTemplates.templates = templates;
  }

  private _modelChangeValue: any = {};

  private valueChangesUnsubscribe = () => {};

  constructor(
    private builder: StackFormBuilder,
    private config: StackFormsConfig,
    private ngZone: NgZone,
    private fieldTemplates: StackFieldTemplates
  ) {}

  ngDoCheck(): void {
    if (this.config.extras.checkExpressionOn === 'changeDetectionCheck') {
      this.checkExpressionChange();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields'] && this.form) {
      clearControl(this.form);
    }

    if (
      changes['fields'] ||
      changes['form'] ||
      (changes['model'] && this._modelChangeValue !== changes['model'].currentValue)
    ) {
      this.valueChangesUnsubscribe();
      this.builder.build(this.field);
      this.valueChangesUnsubscribe = this.valueChanges();
    }
  }

  ngOnDestroy() {
    this.valueChangesUnsubscribe();
  }

  private checkExpressionChange() {
    this.field.options?.checkExpressions?.(this.field);
  }

  private setField(field: StackFieldConfigCache) {
    if (this.config.extras.immutable) {
      this.field = { ...this.field, ...clone(field) };
    } else {
      Object.keys(field).forEach((p) => ((this.field as any)[p] = (field as any)[p]));
    }
  }

  private valueChanges() {
    this.valueChangesUnsubscribe();

    let formEvents: Subscription | null = null;
    if (isSignalRequired()) {
      let submitted = this.options?.parentForm?.submitted;
      formEvents = (this.form as any).events.subscribe(() => {
        if (submitted !== this.options.parentForm?.submitted) {
          this.options.detectChanges?.(this.field);
          submitted = this.options.parentForm?.submitted;
        }
      });
    }

    let fieldChangesDetection: any[] = [];
    const valueChanges = this.field.options?.fieldChanges
      ?.pipe(
        filter(({ field, type }) => hasKey(field) && type === 'valueChanges'),
        switchMap(() => (isNoopNgZone(this.ngZone) ? of(null) : this.ngZone.onStable.asObservable().pipe(take(1))))
      )
      .subscribe(() =>
        this.ngZone.runGuarded(() => {
          // runGuarded is used to keep in sync the expression changes
          // https://github.com/ngx-formly/ngx-formly/issues/2095
          this.checkExpressionChange();
          if (this.field.options) {
            fieldChangesDetection.push(
              observeDeep(this.field.options, ['formState'], () => this.field.options?.detectChanges?.(this.field))
            );
          }
          this.modelChange.emit((this._modelChangeValue = clone(this.model)));
        })
      );

    return () => {
      fieldChangesDetection.forEach((fnc) => fnc());
      formEvents?.unsubscribe();
      valueChanges?.unsubscribe();
    };
  }
}
