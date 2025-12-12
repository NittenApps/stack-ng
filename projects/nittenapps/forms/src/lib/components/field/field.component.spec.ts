/**
 * @jest-environment jsdom
 */

import { ChangeDetectionStrategy, Component, Injectable, Optional } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import {
  createFieldChangesSpy,
  createFieldComponent,
  StackFieldInput,
  StackInputModule,
  StackWrapperFormField,
  ɵCustomEvent,
} from '@nittenapps/forms/testing';
import { BehaviorSubject, lastValueFrom, map, shareReplay, tap, timer } from 'rxjs';
import { FieldType, FieldWrapper } from '../../directives';
import { StackFieldConfig, StackFieldConfigCache, StackFormsExtension } from '../../types';

const renderComponent = (field: StackFieldConfig | null, opts: any = {}) => {
  const { config, ...options } = opts;

  return createFieldComponent(field, {
    imports: [StackInputModule],
    declarations: [
      StackChildComponent,
      StackGroupLocalControlType,
      StackOnPopulateType,
      StackOnPushComponent,
      StackParentComponent,
      StackWrapperFormFieldAsync,
    ],
    config: {
      types: [
        {
          name: 'on-push',
          component: StackOnPushComponent,
        },
        {
          name: 'parent',
          component: StackParentComponent,
        },
        {
          name: 'child',
          component: StackChildComponent,
        },
        {
          name: 'on-populate',
          component: StackOnPopulateType,
        },
      ],
      wrappers: [
        {
          name: 'form-field-async',
          component: StackWrapperFormFieldAsync,
        },
      ],
      ...(config || {}),
    },
    ...options,
  });
};

describe('StackField Component', () => {
  it('should add field className', () => {
    const { query } = renderComponent({ className: 'foo-class' });

    expect(query('nas-field').attributes['class']).toEqual('foo-class');
  });

  it('should allow construct component type', async () => {
    await TestBed.configureTestingModule({
      declarations: [StackOnPushComponent],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    const fixture = TestBed.createComponent(StackOnPushComponent);
    const detectChanges = () => fixture.detectChanges();

    expect(detectChanges).not.toThrow();
  });

  describe('host attrs', () => {
    it('should set style and class attrs on first render', () => {
      const { query } = renderComponent(
        { hide: true, className: 'foo' },
        { config: { extras: { lazyRender: false } } }
      );

      expect(query('nas-field').attributes['class']).toEqual('foo');
      expect(query('nas-field').styles['display']).toEqual('none');
    });

    it('should update style and class attrs on change', () => {
      const { field, query } = renderComponent({}, { config: { extras: { lazyRender: false } } });

      expect(query('nas-field').attributes['class']).toBeUndefined();
      expect(query('nas-field').styles['display']).toEqual('');

      field.hide = true;
      field.className = 'foo';

      expect(query('nas-field').attributes['class']).toEqual('foo');
      expect(query('nas-field').styles['display']).toEqual('none');
    });

    it('should not override existing class', () => {
      const { query } = renderComponent({}, { template: '<nas-field class="foo" [field]="field"></nas-field>' });

      expect(query('nas-field').attributes['class']).toEqual('foo');
    });
  });

  describe('disable renderStackFieldElement', () => {
    it('should not render content inside nas-field element', () => {
      const { query } = renderComponent({ type: 'input' }, { config: { extras: { renderStackFieldElement: false } } });

      expect(query('nas-wrapper-form-field')).toBeDefined();
      expect(query('nas-field > nas-wrapper-form-field')).toBeNull();
    });

    it('should apply className and styles to nas-field wrapper', () => {
      const { field, detectChanges, query } = renderComponent(
        {
          hide: true,
          type: 'input',
          className: 'foo',
        },
        { config: { extras: { lazyRender: false, renderStackFieldElement: false } } }
      );
      const nasField = query('nas-field');
      const wrapper = query('nas-wrapper-form-field');

      expect(nasField.styles['display']).toEqual('');
      expect(nasField.attributes['class']).toBeUndefined();
      expect(wrapper.styles['display']).toEqual('none');
      expect(wrapper.attributes['class']).toEqual('foo');

      field.hide = false;
      field.className = '';
      detectChanges();

      expect(wrapper.styles['display']).toEqual('');
      expect(wrapper.styles['display']).toEqual('');
    });
  });

  it('should call field hooks if set', () => {
    const f: StackFieldConfig = {
      hooks: {
        afterContentInit: () => {},
        afterViewInit: () => {},
        onInit: () => {},
        onChanges: () => {},
        onDestroy: () => {},
      },
    };

    const hooks = f.hooks!;
    Object.keys(f.hooks!).forEach((hook) => {
      jest.spyOn(hooks, hook as any);
    });

    const { fixture, field } = renderComponent(f);
    fixture.destroy();

    Object.keys(f.hooks!).forEach((name) => {
      expect((hooks as any)[name]).toHaveBeenCalledWith(field);
    });
  });

  it('should render field type without wrapper', () => {
    const { query } = renderComponent({
      key: 'title',
      type: 'input',
      wrappers: [],
    });

    expect(query('nas-wrapper-form-field')).toBeNull();
    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should allow passing component to the field definition', () => {
    const { query } = renderComponent({
      key: 'title',
      type: StackFieldInput,
    });

    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should render field component with wrapper', () => {
    const { query } = renderComponent({
      key: 'title',
      type: 'input',
      wrappers: ['form-field'],
    });

    expect(query('nas-wrapper-form-field')).not.toBeNull();
    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should allow passing wrapper component to the field definition', () => {
    const { query } = renderComponent({
      key: 'title',
      type: StackFieldInput,
      wrappers: [StackWrapperFormField],
    });

    expect(query('nas-wrapper-form-field')).not.toBeNull();
    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should re-render on change', () => {
    const { query, setInputs, detectChanges } = renderComponent({ key: 'foo', type: 'input', wrappers: [] });

    expect(query('nas-wrapper-form-field')).toBeNull();

    setInputs({ field: { key: 'foo', type: 'input' } });
    detectChanges();

    expect(query('nas-wrapper-form-field')).not.toBeNull();
  });

  it('should not throw error when field is null', () => {
    const render = () => renderComponent(null);

    expect(render).not.toThrow();
  });

  it('should render field component with async wrapper', () => {
    const { field, detectChanges, query } = renderComponent({
      key: 'title',
      type: 'input',
      wrappers: ['form-field-async'],
      props: { render: false },
    });

    expect(query('nas-wrapper-form-field-async')).not.toBeNull();
    expect(query('nas-type-input')).toBeNull();

    field.props!['render'] = true;
    detectChanges();

    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should lazy render field components by default', () => {
    const { field, detectChanges, query } = renderComponent({
      key: 'title',
      type: 'input',
      hide: true,
    });

    expect(query('nas-type-input')).toBeNull();

    field.hide = false;
    detectChanges();

    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should add style display none to hidden field', () => {
    const { field, detectChanges, query } = renderComponent(
      { hide: true },
      { config: { extras: { lazyRender: false } } }
    );
    const { styles } = query('nas-field');

    expect(styles['display']).toEqual('none');

    field.hide = false;
    detectChanges();

    expect(styles['display']).toEqual('');
  });

  it('init hooks with observables', () => {
    const control = new FormControl();
    const spy = jest.fn();
    const initHookFn = (f: StackFieldConfig) => {
      return f.formControl?.valueChanges.pipe(tap(spy));
    };
    const { fixture } = renderComponent({
      key: 'title',
      type: 'input',
      formControl: control,
      modelOptions: {},
      parent: {
        formControl: new FormGroup({}),
      },
      hooks: {
        afterContentInit: initHookFn,
        afterViewInit: initHookFn,
        onInit: initHookFn,
      },
    });

    expect(spy).not.toHaveBeenCalled();

    control.patchValue('test');

    expect(spy).toHaveBeenCalledTimes(3);

    spy.mockReset();
    fixture.destroy();
    control.patchValue('test');

    expect(spy).not.toHaveBeenCalled();
  });

  it('should render after onInit', () => {
    const { query } = renderComponent({
      type: 'input',
      hooks: {
        onInit: (f: StackFieldConfigCache) => (f.formControl = new FormControl()),
      },
    });

    expect(query('nas-type-input')).not.toBeNull();
  });

  it('should render field type for each nas-field instance', () => {
    const { queryAll } = renderComponent(
      {
        type: 'input',
        formControl: new FormControl(),
        modelOptions: {},
        props: { duplicate: true },
      },
      {
        template: `
          <nas-field *ngIf="field.props.duplicate" [field]="field"></nas-field>
          <nas-field class="target" [field]="field"></nas-field>
        `,
      }
    );

    expect((queryAll('nas-type-input') as any).length).toEqual(2);
  });

  it('should update template options of OnPush FieldType #2191', async () => {
    const options$ = timer(0).pipe(
      map(() => [{ value: 5, label: 'Option 5' }]),
      shareReplay(1)
    );
    const { field, query, detectChanges } = renderComponent({
      key: 'push',
      type: 'on-push',
      props: {
        options: [{ value: 1, label: 'Option 1' }],
      },
      expressions: {
        'props.options': options$,
      },
    });

    const onPushInstance = query('.props').nativeElement;
    expect(onPushInstance.textContent).toEqual(
      JSON.stringify(
        {
          ...field.props,
          options: [{ value: 1, label: 'Option 1' }],
        },
        null,
        2
      )
    );

    await lastValueFrom(options$);

    detectChanges();

    expect(onPushInstance.textContent).toEqual(
      JSON.stringify(
        {
          ...field.props,
          options: [{ value: 5, label: 'Option 5' }],
        },
        null,
        2
      )
    );
  });

  it('should update observable expressions on render', () => {
    const stream$ = new BehaviorSubject('test');
    const { field, fixture } = renderComponent({
      expressions: {
        'props.label': stream$,
      },
    });

    expect(field.props?.label).toEqual('test');

    fixture.destroy();
    stream$.next('test2');

    expect(field.props?.label).toEqual('test');
  });

  it('should detect observable expressions changes', fakeAsync(() => {
    const timer$ = timer(100);
    const { query, detectChanges } = renderComponent({
      type: 'on-push',
      expressions: {
        'props.ticker': timer$,
      },
    });

    tick(150);
    detectChanges();

    expect(query('.props').nativeElement.textContent).toContain('ticker');
  }));

  it('should update template options of OnPush FieldType #2191', async () => {
    const { field, query } = renderComponent({ type: 'on-populate' });

    expect(field.props!['getInstanceId']()).toEqual(query('nas-on-populate-component').componentInstance.instanceId);

    field.props!['setInstanceId']('123456');

    expect(query('nas-on-populate-component').componentInstance.instanceId).toEqual('123456');
  });

  describe('formState update', () => {
    it('should take account of formState update', () => {
      const { field, query, detectChanges, fixture } = renderComponent({
        key: 'push',
        type: 'on-push',
        props: {},
        options: { formState: { foo: true } },
      });

      expect(query('.formState').nativeElement.textContent).toEqual(JSON.stringify({ foo: true }, null, 2));

      field.options!.formState.foo = false;
      detectChanges();

      fixture.whenStable().then(() => {
        expect(query('.formState').nativeElement.textContent).toEqual(JSON.stringify({ foo: false }, null, 2));
      });
    });

    it('should apply formState update to all fields', () => {
      const options = { formState: { foo: true } };
      const { field, query, detectChanges, fixture } = renderComponent({
        options,
        fieldGroup: [
          {
            key: 'push',
            type: 'on-push',
          },
          {
            key: 'test',
          },
        ],
      });

      expect(query('.formState').nativeElement.textContent).toEqual(JSON.stringify({ foo: true }, null, 2));

      field.options!.formState.foo = false;
      detectChanges();

      fixture.whenStable().then(() => {
        expect(query('.formState').nativeElement.textContent).toEqual(JSON.stringify({ foo: false }, null, 2));
      });
    });
  });

  describe('valueChanges', () => {
    it('should emit valueChanges on control value change', () => {
      const { field } = renderComponent({
        key: 'foo',
        type: 'input',
      });

      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.setValue('First value');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ value: 'First value', field, type: 'valueChanges' });
      expect(field.model).toEqual({ foo: 'First value' });
      subscription.unsubscribe();
    });

    it('should apply parsers to the emitted valueChanges', () => {
      const { field } = renderComponent({
        key: 'foo',
        type: 'input',
        parsers: [Number],
      });

      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.setValue('15');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ value: 15, field, type: 'valueChanges' });
      expect(field.formControl?.value).toEqual(15);
      subscription.unsubscribe();
    });

    it('should apply debounce to the emitted valueChanges', fakeAsync(() => {
      const { field } = renderComponent({
        key: 'foo',
        type: 'input',
        modelOptions: {
          debounce: { default: 5 },
        },
      });

      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.setValue('15');

      expect(spy).not.toHaveBeenCalled();

      tick(6);

      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should ignore default debounce when using "blur" or "submit"', () => {
      const { field } = renderComponent({
        key: 'foo',
        type: 'input',
        modelOptions: {
          debounce: { default: 5 },
          updateOn: 'blur',
        },
      });
      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.setValue('15');

      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    });

    it('should emit a valid model value when using square bracket notation for key', () => {
      const { field } = renderComponent({
        key: 'o[0].0.name',
        type: 'input',
      });

      field.formControl?.setValue('***');

      expect(field.parent?.model).toEqual({ o: [[{ name: '***' }]] });
    });

    it('should emit a valid model value when using square bracket notation for a fieldGroup key', () => {
      const { field } = renderComponent({
        key: 'group[0]',
        fieldGroup: [{ key: 'name', type: 'input' }],
      });

      field.fieldGroup?.[0].formControl?.setValue('***');
      expect(field.parent?.model).toEqual({ group: [{ name: '***' }] });
    });

    it('should emit valueChanges on group control value change', () => {
      const { field } = renderComponent({
        key: 'foo',
        fieldGroup: [{ type: 'input', key: 'bar' }],
      });

      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.setValue({ bar: 'First value' });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ value: 'First value', field: field.fieldGroup?.[0], type: 'valueChanges' });
      expect(field.parent?.model).toEqual({ foo: { bar: 'First value' } });
      subscription.unsubscribe();
    });

    it('should emit `modelChange` when custom FormGroup change', () => {
      const { field } = renderComponent({
        key: 'foo',
        formControl: new FormGroup({
          bar: new FormControl(),
        }),
      });
      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.get('bar')?.setValue('foo');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ value: { bar: 'foo' }, field, type: 'valueChanges' });
      expect(field.parent?.model).toEqual({ foo: { bar: 'foo' } });
      subscription.unsubscribe();
    });

    it('should emit `modelChange` twice when key is duplicated', () => {
      const { field } = renderComponent({
        fieldGroup: [
          { key: 'title', type: 'input' },
          { key: 'title', type: 'input' },
        ],
      });
      const [spy, subscription] = createFieldChangesSpy(field);

      field.formControl?.get('title')?.setValue('***');

      expect(spy).toHaveBeenCalledTimes(2);
      subscription.unsubscribe();
    });

    it('should keep the value in sync when using multiple fields with same key', () => {
      const { field, detectChanges, queryAll } = renderComponent({
        fieldGroup: [
          { key: 'title', type: 'input' },
          { key: 'title', type: 'input' },
        ],
      });
      const inputs = queryAll<HTMLInputElement>('input');
      (inputs as any)[0].triggerEventHandler('input', ɵCustomEvent({ value: 'First' }));
      detectChanges();

      expect(field.formControl?.value).toEqual({ title: 'First' });
      expect((inputs as any)[0].nativeElement.value).toEqual('First');
      expect((inputs as any)[1].nativeElement.value).toEqual('First');
    });

    it('should emit valueChanges on local field changes', () => {
      const { field } = renderComponent({
        type: StackGroupLocalControlType,
        wrappers: ['form-field'],
        fieldGroup: [{ key: 'title' }],
      });

      const [spy, subscription] = createFieldChangesSpy(field);

      field.get?.('title')?.formControl?.setValue('First value');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(field.model).toEqual({ title: 'First value' });
      subscription.unsubscribe();
    });
  });

  it('should detect formControl status changes', () => {
    const { query, field, detectChanges } = renderComponent({ key: 'foo', type: 'input' });
    field.formControl?.markAsTouched();
    field.formControl?.setErrors({ server: { message: 'server error :)' } });
    detectChanges();

    expect(query('nas-validation-message')).not.toBeNull();
    expect(query('nas-validation-message').nativeElement.textContent).toEqual('server error :)');
  });

  describe('component-level injectors', () => {
    it('should inject parent service to child type', () => {
      // should inject `ParentService` in `ChildComponent` without raising an error
      const { query } = renderComponent({
        type: 'parent',
        fieldGroup: [
          {
            type: 'child',
            fieldGroup: [{ key: 'email', type: 'input' }],
          },
        ],
      });

      const childInstance: StackChildComponent = query('nas-child').componentInstance;

      expect(childInstance.parent).not.toBeNull();
      expect(childInstance.wrapper).toBeNull();
    });

    it('should inject parent wrapper to child type', () => {
      const { query } = renderComponent({
        wrappers: ['form-field-async'],
        props: { render: true },
        fieldGroup: [
          {
            type: 'child',
            fieldGroup: [{ key: 'email', type: 'input' }],
          },
        ],
      });

      // should inject `StackWrapperLabel` in `ChildComponent` without raising an error
      const childInstance: StackChildComponent = query('nas-child').componentInstance;

      expect(childInstance.wrapper).not.toBeNull();
      expect(childInstance.parent).toBeNull();
    });
  });
});

@Component({
  selector: 'nas-wrapper-form-field-async',
  template: `
    @if (props.render) {
    <div>
      <ng-container #fieldComponent></ng-container>
    </div>
    }
  `,
  standalone: false,
})
class StackWrapperFormFieldAsync extends FieldWrapper {}

@Component({
  selector: 'nas-on-push-component',
  template: `
    <div class="props">{{ props | json }}</div>
    <div class="formState">{{ formState | json }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StackOnPushComponent extends FieldType {}

@Component({
  selector: 'nas-on-populate-component',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StackOnPopulateType extends FieldType implements StackFormsExtension {
  instanceId = Math.random().toString(36).substring(2, 5);

  onPopulate(field: StackFieldConfig): void {
    field.props!['getInstanceId'] = () => this.instanceId;
    field.props!['setInstanceId'] = (instanceId: string) => (this.instanceId = instanceId);
  }
}

@Injectable()
export class ParentService {}

@Component({
  selector: 'nas-parent',
  template: ` @for (f of field.fieldGroup; track f) {<nas-field [field]="f"></nas-field>} `,
  providers: [ParentService],
  standalone: false,
})
export class StackParentComponent extends FieldType {
  constructor(public parent: ParentService) {
    super();
  }
}

@Component({
  selector: 'nas-child',
  template: ` <ng-content></ng-content> `,
  standalone: false,
})
export class StackChildComponent extends FieldType {
  constructor(@Optional() public parent: ParentService, @Optional() public wrapper: StackWrapperFormFieldAsync) {
    super();
  }
}

@Component({
  template: `<input type="text" [formControl]="formControl.get('title')" />`,
  standalone: false,
})
export class StackGroupLocalControlType extends FieldType {}
