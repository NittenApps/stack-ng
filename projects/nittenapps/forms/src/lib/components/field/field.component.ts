import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ComponentRef,
  DoCheck,
  ElementRef,
  EmbeddedViewRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { debounceTime, distinctUntilChanged, isObservable, map, Observable, startWith, Subscription } from 'rxjs';
import { FieldType, FieldWrapper } from '../../directives';
import { StackFieldTemplates, StackFormsConfig } from '../../services';
import { StackFieldConfig, StackFieldConfigCache, StackFormsHookConfig } from '../../types';
import {
  assignFieldValue,
  defineHiddenProp,
  getFieldValue,
  hasKey,
  IObserver,
  isObject,
  isSignalRequired,
  markFieldForCheck,
  observe,
  observeDeep,
} from '../../utils';
import { FormControl } from '@angular/forms';

/**
 * The `<nas-field>` component is used to render the UI widget (layout + type) of a given `field`.
 */
@Component({
    selector: 'nas-field',
    template: '<ng-template #container></ng-template>',
    styleUrls: ['./field.component.scss'],
    standalone: false
})
export class StackField implements DoCheck, OnInit, OnChanges, AfterContentInit, AfterViewInit, OnDestroy {
  /** The field config. */
  @Input() field!: StackFieldConfig;

  @ViewChild('container', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;

  private hostObservers: (IObserver<any> | Subscription)[] = [];

  private componentRefs: (ComponentRef<FieldType> | EmbeddedViewRef<FieldType>)[] = [];

  private hooksObservers: Function[] = [];

  private detectFieldBuild = false;

  private get containerRef() {
    return this.config.extras.renderStackFieldElement ? this.viewContainerRef : this.hostContainerRef;
  }

  private get elementRef() {
    if (this.config.extras.renderStackFieldElement) {
      return this._elementRef;
    }
    if (this.componentRefs?.[0] instanceof ComponentRef) {
      return this.componentRefs[0].location;
    }

    return null;
  }

  valueChangesUnsubscribe = () => {};

  constructor(
    private config: StackFormsConfig,
    private renderer: Renderer2,
    private _elementRef: ElementRef,
    private hostContainerRef: ViewContainerRef,
    @Optional() private form: StackFieldTemplates
  ) {}

  ngDoCheck(): void {
    if (this.detectFieldBuild && this.field && this.field.options) {
      this.render();
    }
  }

  ngOnInit(): void {
    this.triggerHook('onInit');
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.triggerHook('onChanges', changes);
  }

  ngAfterContentInit(): void {
    this.triggerHook('afterContentInit');
  }

  ngAfterViewInit(): void {
    this.triggerHook('afterViewInit');
  }

  ngOnDestroy(): void {
    this.resetRefs(this.field);
    this.hostObservers.forEach((hostObserver) => hostObserver.unsubscribe());
    this.hooksObservers.forEach((unsubscribe) => unsubscribe());
    this.valueChangesUnsubscribe();
    this.triggerHook('onDestroy');
  }

  private attachComponentRef<T extends FieldType>(
    ref: ComponentRef<T> | EmbeddedViewRef<T>,
    field: StackFieldConfigCache
  ): void {
    this.componentRefs.push(ref);
    field._componentRefs?.push(ref);
    if (ref instanceof ComponentRef) {
      Object.assign(ref.instance, { field });
    }
  }

  private fieldChanges(field: StackFieldConfigCache | undefined): () => any {
    if (!field) {
      return () => {};
    }

    const propsObserver = observeDeep(field, ['props'], () => field.options?._detectChanges?.(field));
    const subscribes = [
      () => {
        propsObserver();
      },
    ];

    for (const key of Object.keys(field._expressions || {})) {
      const expressionObserver = observe<any>(field, ['_expressions', key], ({ currentValue, previousValue }) => {
        if (previousValue?.subscription) {
          previousValue.subscription.unsubscribe();
          previousValue.subscription = null;
        }
        if (isObservable(currentValue.value$)) {
          currentValue.subscription = currentValue.value$.subscribe();
        }
      });
      subscribes.push(() => {
        if (field._expressions?.[key]?.subscription) {
          field._expressions[key].subscription.unsubscribe();
        }
        expressionObserver.unsubscribe();
      });
    }

    for (const path of [['focus'], ['template'], ['fieldGroupClassName'], ['validation', 'show']]) {
      const fieldObserver = observe(
        field,
        path,
        ({ firstChange }) => !firstChange && field.options?.detectChanges?.(field)
      );
      subscribes.push(() => fieldObserver.unsubscribe());
    }

    if (field.formControl && !field.fieldGroup) {
      const control = field.formControl;
      let valueChanges = control.valueChanges.pipe(
        map((value) => {
          field.parsers?.map((parserFn) => (value = (parserFn as any)(value, field)));
          if (!Object.is(value, field.formControl?.value)) {
            field.formControl?.setValue(value);
          }

          return value;
        }),
        distinctUntilChanged((x, y) => {
          if (x !== y || Array.isArray(x) || isObject(x)) {
            return false;
          }

          return true;
        })
      );

      if (control.value !== getFieldValue(field)) {
        valueChanges = valueChanges.pipe(startWith(control.value));
      }

      const { updateOn, debounce } = field.modelOptions!;
      if ((!updateOn || updateOn === 'change') && (debounce?.default || 0) > 0) {
        valueChanges = control.valueChanges.pipe(debounceTime(debounce!.default));
      }

      const sub = valueChanges.subscribe((value) => {
        // workaround for https://github.com/angular/angular/issues/13792
        if ((control._fields?.length || 0) > 1 && control instanceof FormControl) {
          control.patchValue(value, { emitEvent: false, onlySelf: true });
        }

        if (hasKey(field)) {
          assignFieldValue(field, value);
        }
        field.options?.fieldChanges?.next({ value, field, type: 'valueChanges' });
      });

      subscribes.push(() => sub.unsubscribe());
    }

    let templateFieldsSubs: (() => void)[] = [];
    observe(field, ['_localFields'], ({ currentValue }) => {
      templateFieldsSubs.forEach((unsubscribe) => unsubscribe());
      templateFieldsSubs = (currentValue || []).map((f: StackFieldConfigCache) => this.fieldChanges(f));
    });

    return () => {
      subscribes.forEach((unsubscribe) => unsubscribe());
      templateFieldsSubs.forEach((unsubscribe) => unsubscribe());
    };
  }

  private render(): void {
    if (!this.field) {
      return;
    }

    // require StackForms build
    if (!this.field.options) {
      this.detectFieldBuild = true;
      return;
    }

    this.detectFieldBuild = false;
    this.hostObservers.forEach((hostObserver) => hostObserver.unsubscribe());
    this.hostObservers = [
      observe<boolean>(this.field, ['hide'], ({ firstChange, currentValue }) => {
        const containerRef = this.containerRef;
        if (this.config.extras.lazyRender === false) {
          firstChange && this.renderField(containerRef, this.field);
          if (!firstChange || (firstChange && currentValue)) {
            this.elementRef &&
              this.renderer.setStyle(this.elementRef.nativeElement, 'display', currentValue ? 'none' : '');
          }
        } else {
          if (currentValue) {
            containerRef.clear();
            if (this.field.className) {
              this.renderer.removeAttribute(this.elementRef?.nativeElement, 'class');
            }
          } else {
            this.renderField(containerRef, this.field);
            if (this.field.className) {
              this.renderer.setAttribute(this.elementRef?.nativeElement, 'class', this.field.className);
            }
          }
        }

        !firstChange && this.field.options?.detectChanges?.(this.field);
      }),
      observe<string>(this.field, ['className'], ({ firstChange, currentValue }) => {
        if (
          (!firstChange || (firstChange && currentValue)) &&
          (!this.config.extras.lazyRender || this.field.hide !== true)
        ) {
          this.elementRef && this.renderer.setAttribute(this.elementRef.nativeElement, 'class', currentValue);
        }
      }),
    ];

    if (!isSignalRequired()) {
      ['touched', 'pristine', 'status'].forEach((prop) =>
        this.hostObservers.push(
          observe<string>(
            this.field,
            ['formControl', prop],
            ({ firstChange }) => !firstChange && markFieldForCheck(this.field)
          )
        )
      );
    } else if (this.field.formControl) {
      const events = ((this.field.formControl as any).events as Observable<any>).subscribe(() =>
        markFieldForCheck(this.field)
      );
      this.hostObservers.push(events);
    }
  }

  private renderField(
    containerRef: ViewContainerRef,
    f: StackFieldConfigCache,
    wrappers: StackFieldConfig['wrappers'] = []
  ): void {
    if (this.containerRef === containerRef) {
      this.resetRefs(this.field);
      this.containerRef.clear();
      wrappers = this.field?.wrappers;
    }

    if ((wrappers?.length || 0) > 0) {
      const [wrapper, ...wps] = wrappers!;
      const { component } = this.config.getWrapper(wrapper);

      const ref = containerRef.createComponent<FieldWrapper>(component);
      this.attachComponentRef(ref, f);
      observe<ViewContainerRef & { _lContainer: any }>(
        ref.instance,
        ['fieldComponent'],
        ({ currentValue, previousValue, firstChange }) => {
          if (currentValue) {
            if (previousValue && previousValue._lContainer === currentValue._lContainer) {
              return;
            }

            const viewRef = previousValue ? previousValue.detach() : null;
            if (viewRef && !viewRef.destroyed) {
              currentValue.insert(viewRef);
            } else {
              this.renderField(currentValue, f, wps);
            }

            !firstChange && ref.changeDetectorRef.detectChanges();
          }
        }
      );
    } else if (f?.type) {
      const inlineType = this.form?.templates?.find((ref) => ref.name === f.type);
      let ref: ComponentRef<any> | EmbeddedViewRef<any>;
      if (inlineType) {
        ref = containerRef.createEmbeddedView(inlineType.ref, { $implicit: f });
      } else {
        const { component } = this.config.getType(f.type, true)!;
        ref = containerRef.createComponent<FieldWrapper>(component as any);
      }
      this.attachComponentRef(ref, f);
    }
  }

  private resetRefs(field: StackFieldConfigCache): void {
    if (field) {
      if (field._localFields) {
        field._localFields = [];
      } else {
        defineHiddenProp(this.field, '_localFields', []);
      }

      if (field._componentRefs) {
        field._componentRefs = field._componentRefs.filter((ref) => this.componentRefs.indexOf(ref) === -1);
      } else {
        defineHiddenProp(this.field, '_componentRefs', []);
      }
    }

    this.componentRefs = [];
  }

  private triggerHook(name: keyof StackFormsHookConfig, changes?: SimpleChanges): void {
    if (name === 'onInit' || (name === 'onChanges' && changes?.['field'] && !changes['field']?.firstChange)) {
      this.valueChangesUnsubscribe();
      this.valueChangesUnsubscribe = this.fieldChanges(this.field);
    }

    if (this.field?.hooks?.[name]) {
      if (!changes || changes['field']) {
        const r = this.field.hooks[name](this.field);
        if (isObservable(r) && ['onInit', 'afterContentInit', 'afterViewInit'].indexOf(name) !== -1) {
          const sub = r.subscribe();
          this.hooksObservers.push(() => sub.unsubscribe());
        }
      }
    }

    if (name === 'onChanges' && changes?.['field']) {
      this.resetRefs(changes['field'].previousValue);
      this.render();
    }
  }
}
