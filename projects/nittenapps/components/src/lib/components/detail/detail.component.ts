import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { ActivityService, ApiConfig, ApiResponse, ConfigService, NAS_API_CONFIG, ObjectBody } from '@nittenapps/api';
import { DirtyAware, FieldGroup } from '@nittenapps/common';
import { StackFieldConfig, StackFormOptions } from '@nittenapps/forms';
import { map, Observable } from 'rxjs';

@Component({
  template: '',
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
    this.route.data.subscribe((data) => {
      this.initModel(data);
      this.initFields();
      this.options = this.initFormOptions();
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
      fieldGroup.fields?.forEach((field) => {
        const fieldConfig: StackFieldConfig = { props: { label: field.name }, expressions: {} };
        switch (field.type) {
          case 'AN':
            fieldConfig.key = `attributes.${field.code}.0.stringValue`;
            fieldConfig.type = 'input';
            if (field.definition?.pattern) {
              fieldConfig.props!.pattern = new RegExp(field.definition.pattern);
            }
            fieldConfig.props!.maxLength = field.definition?.maxLength ? +field.definition.maxLength : undefined;
            fieldConfig.props!.minLength = field.definition?.minLength ? +field.definition.minLength : undefined;
            break;
          case 'CT':
            if (field.definition?.multiple) {
              fieldConfig.key = `attributes.${field.code}`;
            } else {
              fieldConfig.key = `attributes.${field.code}.0.catalogValue`;
            }
            fieldConfig.type = 'select';
            fieldConfig.props!.options = this.configService.getCatalogValues(field.definition!.catalog!);
            fieldConfig.props!['multiple'] = field.definition?.multiple;
            break;
          case 'DC':
            fieldConfig.key = `attributes.${field.code}`;
            fieldConfig.type = 'file';
            fieldConfig.props!['multiple'] = field.definition?.multiple;
            break;
          case 'DO':
            fieldConfig.key = `attributes.${field.code}.0.dateValue`;
            fieldConfig.type = 'datepicker';
            break;
          case 'DT':
            fieldConfig.key = `attributes.${field.code}.0.dateValue`;
            fieldConfig.type = 'datetimepicker';
            break;
          case 'NM':
            fieldConfig.key = `attributes.${field.code}.0.numberValue`;
            fieldConfig.type = 'number';
            fieldConfig.props!.max = field.definition?.max ? +field.definition.max : undefined;
            fieldConfig.props!.min = field.definition?.min ? +field.definition.min : undefined;
            break;
          case 'TX':
            fieldConfig.key = `attributes.${field.code}.0.textValue`;
            fieldConfig.type = 'textarea';
            if (field.definition?.pattern) {
              fieldConfig.props!.pattern = new RegExp(field.definition.pattern);
            }
            fieldConfig.props!.maxLength = field.definition?.maxLength ? +field.definition.maxLength : undefined;
            fieldConfig.props!.minLength = field.definition?.minLength ? +field.definition.minLength : undefined;
            break;
          default:
            fieldConfig.key = `attributes.${field.code}.0.stringValue`;
            fieldConfig.type = 'input';
            break;
        }

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

        fg.push(fieldConfig);
      });

      const _fg: StackFieldConfig = {
        props: { label: fieldGroup.name },
        fieldGroup: [{ fieldGroupClassName: 'row row-cols-1 row-cols-md-4', fieldGroup: fg }],
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

  protected abstract getActivity(): string;

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
