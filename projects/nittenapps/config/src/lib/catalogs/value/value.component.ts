import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivityService, ConfigService, NAS_API_CONFIG } from '@nittenapps/api';
import { Catalog, CatalogValue } from '@nittenapps/common';
import { StackFieldConfig, StackFormOptions, StackFormsModule } from '@nittenapps/forms';
import { StackMaterialModule } from '@nittenapps/material';

@Component({
  selector: 'nas-value',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, ReactiveFormsModule, StackFormsModule, StackMaterialModule],
  templateUrl: './value.component.html',
})
export class ValueComponent {
  catalog: Catalog;
  fields: StackFieldConfig[] = [];
  form: FormGroup = new FormGroup({});
  model: any = {};
  options: StackFormOptions = {};

  private activityService: ActivityService<CatalogValue>;
  private configService: ConfigService;

  constructor(private dialog: MatDialogRef<ValueComponent>) {
    const apiConfig = inject(NAS_API_CONFIG);
    const data = inject(MAT_DIALOG_DATA);
    const http = inject(HttpClient);

    this.activityService = new ActivityService(apiConfig, http, 'configCatalogValues');
    this.configService = new ConfigService(apiConfig, http);

    this.catalog = data.catalog;
    this.model = data.value || {};

    this.initFields(this.catalog.attributes || []);
  }

  save(): void {
    this.activityService.save(this.model).subscribe((result) => this.dialog.close(this.model));
  }

  private initFields(attributes: any[]): void {
    const fields: StackFieldConfig[] = [
      {
        key: 'code',
        type: 'uppercase',
        props: { label: 'Código', required: true },
        expressions: { 'props.readonly': 'model.id' },
      },
      {
        key: 'name',
        type: 'uppercase',
        props: { label: 'Nombre', required: true },
      },
      {
        key: 'description',
        type: 'input',
        props: { label: 'Descripción' },
      },
      {
        key: 'active',
        type: 'toggle',
        props: { label: 'Activo' },
      },
    ];

    attributes.forEach((attribute) => {
      const fieldConfig: StackFieldConfig = { props: { label: attribute.name } };
      switch (attribute.type) {
        case 'AN':
          fieldConfig.type = 'input';
          fieldConfig.key = `attributes.${attribute.code}.0.stringValue`;
          break;
        case 'BL':
          fieldConfig.type = 'toggle';
          fieldConfig.key = `attributes.${attribute.code}.0.booleanValue`;
          break;
        case 'CT':
          fieldConfig.type = 'select';
          if (attribute.definition?.multiple) {
            fieldConfig.key = `attributes.${attribute.code}`;
          } else {
            fieldConfig.key = `attributes.${attribute.code}.0.catalogValue`;
          }
          fieldConfig.props!.options = this.configService.getCatalogValues(attribute.definition.catalog);
          fieldConfig.props!['multiple'] = attribute.definition?.multiple;
          break;
        case 'DO':
          fieldConfig.type = 'datepicker';
          fieldConfig.key = `attributes.${attribute.code}.0.dateValue`;
          break;
        case 'DT':
          fieldConfig.type = 'datetimepicker';
          fieldConfig.key = `attributes.${attribute.code}.0.dateValue`;
          break;
        case 'NM':
          fieldConfig.type = 'number';
          fieldConfig.key = `attributes.${attribute.code}.0.numberValue`;
          break;
      }

      fieldConfig.props!.required = attribute.required;

      fields.push(fieldConfig);
    });

    this.fields.push({
      fieldGroupClassName: 'row row-cols-1 row-cols-md-3',
      fieldGroup: fields,
    });
  }
}
