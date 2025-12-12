import { Component, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { StackFormBuilder } from '../../src/lib/services';
import { ConfigOption, StackFieldConfig } from '../../src/lib/types';
import { StackFormsModule } from '../../src/lib/forms.module';

interface IComponentOptions<T> extends NgModule {
  template?: string;
  inputs?: T;
  config?: ConfigOption;
  detectChanges?: boolean;
}

interface IStackDebugElement<E> extends DebugElement {
  readonly nativeElement: E;
}

function setInputs<T>(fixture: ComponentFixture<T>, inputs: T, detectChanges = true) {
  (Object.keys(inputs!) as (keyof T)[]).forEach((input) => {
    fixture.componentInstance[input] = inputs[input];
  });

  if (detectChanges !== false) {
    fixture.detectChanges();
  }
}

export function createComponent<T>({
  template,
  inputs,
  config,
  detectChanges,
  imports,
  declarations,
  providers,
}: IComponentOptions<T>) {
  TestBed.configureTestingModule({
    declarations: [TestComponent, ...(declarations || [])],
    imports: [ReactiveFormsModule, StackFormsModule.forRoot(config), ...(imports || [])],
    providers: providers || [],
    teardown: { destroyAfterEach: false },
  }).overrideComponent(TestComponent, {
    set: {
      template,
      inputs: Object.keys(inputs!),
    },
  });

  const fixture = TestBed.createComponent(TestComponent) as ComponentFixture<T>;
  (Object.keys(inputs!) as (keyof T)[]).forEach((input) => {
    fixture.componentInstance[input] = inputs![input];
  });

  setInputs(fixture, inputs!, detectChanges);

  type FixtureUtils = T & {
    fixture: ComponentFixture<T>;
    detectChanges: typeof fixture['detectChanges'];
    setInputs: (inputs: Partial<T>) => void;
    query: <E extends Element = Element>(selector: string) => IStackDebugElement<E>;
    queryAll: <E extends Element = Element>(selector: string) => IStackDebugElement<E>;
  };

  const utils = {
    fixture,
    detectChanges: () => fixture.detectChanges(),
    setInputs: (props: any) => setInputs(fixture, props),
    query: (selector: string) => fixture.debugElement.query(By.css(selector)),
    queryAll: (selector: string) => fixture.debugElement.queryAll(By.css(selector)),
  } as FixtureUtils;

  (Object.keys(inputs!) as (keyof T)[]).forEach((input) => {
    Object.defineProperty(utils, input, {
      get: () => fixture.componentInstance[input],
    });
  });

  return utils;
}

export function createFieldComponent(
  field: StackFieldConfig | null,
  config: IComponentOptions<{ field: StackFieldConfig }> = {}
) {
  const model = field?.model || {};
  const options = field?.options || {};
  delete (field as any)?.model;
  delete (field as any)?.options;

  field = field || {};

  const utils = createComponent<{ field: StackFieldConfig }>({
    template: '<nas-field [field]="field" />',
    inputs: { field },
    ...config,
    detectChanges: false,
  });
  const builder = (utils.fixture.componentRef.instance as any).builder;
  builder.build({ model, options, fieldGroup: [field] });
  utils.detectChanges();

  const setInputs = utils.setInputs;
  utils.setInputs = (props) => {
    if (props.field) {
      builder.build(props.field);
    }
    setInputs(props);
  };

  return utils;
}

@Component({
    selector: 'nas-form-test-component',
    template: '',
    providers: [StackFormBuilder],
    standalone: false
})
class TestComponent {
  constructor(public builder?: StackFormBuilder) {}
}
