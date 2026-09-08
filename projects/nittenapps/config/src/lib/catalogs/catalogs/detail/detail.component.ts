import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Catalog, FieldGroup } from '@nittenapps/common';
import { BaseDetailComponent, DetailToolbarComponent } from '@nittenapps/components';
import { StackFieldConfig, StackFormsModule } from '@nittenapps/forms';
import {
  StackMatInputModule,
  StackMatSelectModule,
  StackMatTableModule,
  StackMatToggleModule,
} from '@nittenapps/material';
import { Observable } from 'rxjs';
import { AttributeComponent } from '../../attribute/attribute.component';

/**
 * Detail form for managing catalog metadata and its attributes.
 *
 * This component extends the base detail pattern and provides the field configuration
 * needed to create or edit a catalog, as well as the actions to add or edit catalog
 * attribute records through an attribute dialog.
 */
@Component({
  selector: 'nas-catalogs-detail',
  imports: [
    AsyncPipe,
    DetailToolbarComponent,
    ReactiveFormsModule,
    StackFormsModule,
    StackMatInputModule,
    StackMatSelectModule,
    StackMatTableModule,
    StackMatToggleModule,
  ],
  templateUrl: './detail.component.html',
})
export class DetailComponent extends BaseDetailComponent<Catalog> {
  /**
   * Creates a detail component instance.
   *
   * @param dialog Material dialog service used to open the attribute editor.
   */
  constructor(private dialog: MatDialog) {
    super();
  }

  /**
   * Builds the form configuration for the catalog details and attributes table.
   *
   * @param _fieldGroups Available field groups from the parent detail component.
   * @returns The stack field configuration used to render the form.
   */
  protected override configFields(_fieldGroups: FieldGroup[]): StackFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row row-cols-1 row-cols-md-4',
        fieldGroup: [
          {
            key: 'code',
            type: 'uppercase',
            props: {
              label: 'Código',
              required: true,
            },
            expressions: {
              'props.readonly': 'model.id',
            },
          },
          {
            key: 'name',
            type: 'input',
            props: {
              label: 'Nombre',
              required: true,
            },
          },
          {
            key: 'description',
            type: 'input',
            props: {
              label: 'Descripción',
            },
          },
          {
            key: 'active',
            type: 'toggle',
            props: {
              label: 'Activo',
            },
          },
          {
            key: 'sortBy',
            type: 'select',
            props: {
              label: 'Ordenar por',
              options: [
                { value: 'code', label: 'Código' },
                { value: 'name', label: 'Nombre' },
              ],
            },
          },
        ],
      },
      {
        type: 'table',
        key: 'attributes',
        props: {
          addable: true,
          editable: true,
          add: this.addAttribute.bind(this),
          edit: this.editAttribute.bind(this),
        },
        fieldArray: {
          fieldGroup: [
            { key: 'code', type: 'string', props: { label: 'Código', order: 10 } },
            { key: 'name', type: 'string', props: { label: 'Nombre', order: 20 } },
            { key: 'description', type: 'string', props: { label: 'Descripción', order: 30 } },
            { key: 'typeLabel', type: 'string', props: { label: 'Tipo', order: 40 } },
          ],
        },
      },
    ];
  }

  /**
   * Returns the activity key used by the base detail component for auditing and permissions.
   *
   * @returns The activity identifier for catalog management.
   */
  protected override getActivity(): string {
    return 'configCatalogs';
  }

  /**
   * Opens the attribute creation dialog.
   *
   * @returns An observable that resolves when the dialog is closed.
   */
  private addAttribute(): Observable<any> {
    return this.dialog.open(AttributeComponent, { data: {}, width: '90%' }).afterClosed();
  }

  /**
   * Opens the attribute editing dialog for an existing attribute.
   *
   * @param _ Field metadata for the attribute entry.
   * @param value Current attribute values to edit.
   * @returns An observable that resolves when the dialog is closed.
   */
  private editAttribute(_: StackFieldConfig, value: any): Observable<any> {
    return this.dialog.open(AttributeComponent, { data: { ...value }, width: '90%' }).afterClosed();
  }
}
