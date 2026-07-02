import { HttpClient, HttpParams } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { ActivityService, ApiConfig, ApiResponse, ConfigService, NAS_API_CONFIG, ObjectBody } from '@nittenapps/api';
import { DirtyAware, Field, FieldGroup } from '@nittenapps/common';
import { StackFieldConfig, StackFormOptions, StackFormsHookConfig } from '@nittenapps/forms';
import { map, Observable, of } from 'rxjs';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseDetailComponent<T = any> implements AfterViewInit, DirtyAware, OnInit {
  fields!: Observable<StackFieldConfig[]>;
  form: FormGroup = new FormGroup({});
  model!: T;
  options!: StackFormOptions;

  protected readonly activityService!: ActivityService<T>;
  protected readonly apiConfig: ApiConfig;
  protected readonly configService: ConfigService;
  protected readonly http: HttpClient;
  protected readonly route: ActivatedRoute;
  protected readonly router: Router;
  protected saved = false;

  setModel(model: T): void {
    this.model = model;
  }

  constructor() {
    this.apiConfig = inject(NAS_API_CONFIG);
    this.http = inject(HttpClient);
    this.route = inject(ActivatedRoute);
    this.router = inject(Router);

    this.activityService = new ActivityService(this.apiConfig, this.http, this.getActivity());
    this.configService = new ConfigService(this.apiConfig, this.http);
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initFields();
    this.options = this.initFormOptions();

    this.route.data.subscribe((data) => {
      this.initModel(data);
    });
  }

  isDirty(): boolean {
    return !this.saved && this.form.dirty;
  }

  save(): void {
    this.activityService.save(this.prepareValue()).subscribe((response) => {
      if (response.success) {
        this.afterSaved(response);
        this.saved = true;
        this.back();
      }
    });
  }

  protected afterSaved(_response: ApiResponse<T, ObjectBody<T>>): void {}

  protected back(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected configFields(fieldGroups: FieldGroup[]): StackFieldConfig[] {
    const fields: StackFieldConfig[] = [];
    fieldGroups?.forEach((fieldGroup) => {
      const fg: StackFieldConfig[] = [];
      const base = !!fieldGroup.definition?.base
        ? fieldGroup.definition.base + (fieldGroup.definition.base.endsWith('.') ? '' : '.')
        : '';
      fieldGroup.fields?.forEach((field) => {
        const fieldConfig: StackFieldConfig = { props: { label: field.name }, expressions: {} };
        switch (field.type) {
          case 'AN':
            fieldConfig.key = `${base}attributes.${field.code}.0.stringValue`;
            fieldConfig.type = 'input';
            if (field.definition?.pattern) {
              fieldConfig.props!.pattern = new RegExp(field.definition.pattern);
            }
            fieldConfig.props!.maxLength = field.definition?.maxLength ? +field.definition.maxLength : 255;
            fieldConfig.props!.minLength = field.definition?.minLength ? +field.definition.minLength : undefined;
            break;
          case 'AC':
            fieldConfig.key = `${base}attributes.${field.code}.0.catalogValue`;
            fieldConfig.type = 'autocomplete';
            if (field.definition?.reference) {
              const [p, r] = field.definition.reference.split('=');
              fieldConfig.hooks = {
                onInit: (fld: StackFieldConfig) => {
                  const c = fld.parent?.get?.(`attributes.${r}.0.catalogValue`);
                  if (c) {
                    c.props!.change = (_f: StackFieldConfig, event: any) => {
                      if (event?.type === 'change') {
                        return;
                      }
                      if (event?.value?.code) {
                        fld.props!.options =
                          this.configService.getCatalogValues(field.definition!.catalog!, { [p]: event.value.code }) ||
                          of([]);
                      } else {
                        fld.props!.options = of([]);
                      }
                      fld.formControl?.setValue(undefined);
                      fld.props?.change?.(fld, { value: undefined });
                    };
                    c.props!['optionSelected'] = (f: StackFieldConfig, value: any) => {
                      f.props?.change?.(f, { value });

                      fld.formControl?.setValue(undefined);
                    };
                  }
                },
              };
            } else {
              fieldConfig.props!.options = this.getOptions(field);
            }
            break;
          case 'CT':
            if (field.definition?.multiple) {
              fieldConfig.key = `${base}attributes.${field.code}`;
            } else {
              fieldConfig.key = `${base}attributes.${field.code}.0.catalogValue`;
            }
            fieldConfig.type = field.definition?.multiple ? 'multi-select' : 'select';
            fieldConfig.props!.options = this.getOptions(field);
            fieldConfig.props!['multiple'] = field.definition?.multiple;
            break;
          case 'DC':
            fieldConfig.key = `${base}attributes.${field.code}`;
            fieldConfig.type = 'file';
            fieldConfig.props!['multiple'] = field.definition?.multiple;
            break;
          case 'DO':
            fieldConfig.key = `${base}attributes.${field.code}.0.dateValue`;
            fieldConfig.type = 'datepicker';
            break;
          case 'DT':
            fieldConfig.key = `${base}attributes.${field.code}.0.dateValue`;
            fieldConfig.type = 'datetimepicker';
            break;
          case 'LB':
            fieldConfig.key = `${base}attributes.${field.code}`;
            fieldConfig.type = 'logbook';
            break;
          case 'NM':
            fieldConfig.key = `${base}attributes.${field.code}.0.numberValue`;
            fieldConfig.type = 'number';
            fieldConfig.props!.max = field.definition?.max ? +field.definition.max : undefined;
            fieldConfig.props!.min = field.definition?.min ? +field.definition.min : undefined;
            break;
          case 'TX':
            fieldConfig.key = `${base}attributes.${field.code}.0.textValue`;
            fieldConfig.type = 'textarea';
            if (field.definition?.pattern) {
              fieldConfig.props!.pattern = new RegExp(field.definition.pattern);
            }
            fieldConfig.props!.maxLength = field.definition?.maxLength ? +field.definition.maxLength : undefined;
            fieldConfig.props!.minLength = field.definition?.minLength ? +field.definition.minLength : undefined;
            break;
          default:
            fieldConfig.key = `${base}attributes.${field.code}.0.stringValue`;
            fieldConfig.props!.maxLength = field.definition?.maxLength ? +field.definition.maxLength : 255;
            fieldConfig.type = 'input';
            break;
        }

        fieldConfig.props!['format'] = field.definition?.format;

        if (['true', 'yes'].includes(field.definition?.hide?.toLowerCase() || '')) {
          fieldConfig.props!.hidden = true;
        } else if (field.definition?.hide) {
          fieldConfig.expressions!['hide'] = field.definition?.hide;
        }

        if (['true', 'yes'].includes(field.definition?.readonly?.toLowerCase() || '')) {
          fieldConfig.props!.readonly = true;
        } else if (field.definition?.readonly) {
          fieldConfig.expressions!['props.readonly'] = field.definition.readonly;
        }

        if (['true', 'yes'].includes(field.definition?.required?.toLowerCase() || '')) {
          fieldConfig.props!.required = true;
        } else if (field.definition?.required) {
          fieldConfig.expressions!['props.required'] = field.definition?.required;
        }

        fieldConfig.hooks = fieldConfig.hooks || this.createHooks(field);

        fg.push(fieldConfig);
      });

      const lb = fieldGroup.fields?.[0]?.type === 'LB';
      const _fg: StackFieldConfig = {
        props: { label: fieldGroup.name },
        fieldGroup: [{ fieldGroupClassName: 'row row-cols-1' + (lb ? '' : ' row-cols-md-4'), fieldGroup: fg }],
        expressions: {},
      };
      if (['true', 'yes'].includes(fieldGroup.definition?.hide?.toLowerCase() || '')) {
        _fg.props!.hidden = true;
      } else if (fieldGroup.definition?.hide) {
        _fg.expressions!['hide'] = fieldGroup.definition.hide;
      }
      fields.push(_fg);
    });

    return fields;
  }

  protected createHooks(field: Field): StackFormsHookConfig | undefined {
    return undefined;
  }

  protected abstract getActivity(): string;

  protected getFilterMethod(field: Field): (field: StackFieldConfig, term: string) => Observable<any> {
    return (field: StackFieldConfig, term: string): Observable<any> => of([]);
  }

  protected getOptions(
    field: Field,
    params?:
      | HttpParams
      | {
          [param: string]: string | number | boolean | readonly (string | number | boolean)[];
        },
  ): Observable<any> {
    return this.configService.getCatalogValues(field.definition!.catalog!, params);
  }

  protected initFields(): void {
    this.fields = this.activityService.getFieldGroups().pipe(map((fieldGroups) => this.configFields(fieldGroups)));
  }

  protected initFormOptions(): StackFormOptions {
    return { formState: { activity: this.getActivity() } };
  }

  protected initModel(data: Data): void {
    if (data['model']) {
      this.model = data['model'];
    } else {
      this.model = {} as T;
    }
  }

  protected prepareValue(): any {
    return { ...this.model };
  }
}
