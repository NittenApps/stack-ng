import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FieldArrayType, FieldTypeConfig } from '@nittenapps/forms';

export interface ColumnDef {
  key: string;
  label: string;
  type: string;
  format?: string;
  transform?: (row: any) => string | number;
}

@Component({
  selector: 'nas-mat-dynamic-table',
  templateUrl: './master-detail-table.type.html',
  styleUrl: './master-detail-table.type.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackMatMasterDetailTable extends FieldArrayType<FieldTypeConfig> implements OnInit {
  protected readonly faPlus = faPlus;

  protected addDetailLabel = computed<string>(() => this.props['addDetailLabel'] || 'Agregar Detalle');
  protected addDetailMenu = computed<{ label: string; value: any }[] | null>(() => this.props['addDetailMenu'] ?? null);
  protected dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  protected detailColumns = computed<ColumnDef[]>(() => this.props['detailColumns'] || []);
  protected detailKey = computed<string>(() => this.props['detailKey'] || 'details');
  protected detailLabel = computed<string>(() => this.props['detailLabel'] || 'Detalles');
  protected detailRowClass = computed<(row: any) => string>(() => this.props['detailRowClass'] ?? (() => ''));
  protected expandedIds = signal<Set<any>>(new Set());
  protected masterColumns = computed<ColumnDef[]>(() => this.props['masterColumns'] || []);
  protected masterRowClass = computed<(row: any) => string>(() => this.props['masterRowClass'] ?? (() => ''));
  protected showDetailIf = computed<(row: any) => boolean>(() => this.props['showDetailIf'] ?? (() => true));
  @ViewChild('masterTable') protected table!: MatTable<any>;

  protected detailDisplayedColumns = computed<string[]>(() => {
    const colums = [...this.detailColumns().map((c) => c.key)];
    if (
      this.props['hideDetailActions'] !== true &&
      (this.props['onEditDetail'] || this.props['onDeleteDetail'] || this.props['onCancelDetail'])
    ) {
      colums.push('actions');
    }
    return colums;
  });

  protected masterDisplayedColumns = computed<string[]>(() => {
    const colums = ['expand', ...this.masterColumns().map((c) => c.key)];
    if (
      this.props['hideMasterActions'] !== true &&
      (this.props['onEditMaster'] || this.props['onDeleteMaster'] || this.props['onCancelMaster'])
    ) {
      colums.push('actions');
    }
    return colums;
  });

  get formArray(): FormArray {
    return this.formControl as unknown as FormArray;
  }

  private cd = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const masterid = this.props['masterId'] || 'id';
    if (this.model && Array.isArray(this.model)) {
      const initialIds = this.model.map((row: any) => row[masterid]).filter((id) => id != null);
      this.expandedIds.set(new Set(initialIds));
    }

    this.formControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.dataSource.data = [...this.model]));

    this.dataSource.data = [...this.model];
  }

  protected getDetailDataSource(masterIndex: number): MatTableDataSource<any> {
    const detailArray = this.model[masterIndex]?.[this.detailKey()] || [];
    return new MatTableDataSource(detailArray);
  }

  protected isExpanded(element: any): boolean {
    const masterId = this.props['masterId'] || 'id';
    return (!this.props['canExpand'] || this.props['canExpand'](element)) && this.expandedIds().has(element[masterId]);
  }

  protected async onAddDetail(masterIndex: number, selectedOption?: any) {
    if (this.props['onAddDetail']) {
      const masterData = this.model[masterIndex];
      const newDetail = await this.props['onAddDetail'](masterData, selectedOption);
      if (newDetail) {
        const detailKey = this.props['detailKey'] || 'details';
        const currentDetails = this.model[masterIndex][detailKey] || [];
        const newDetailsArray = [...currentDetails, newDetail];

        this.model[masterIndex] = {
          ...this.model[masterIndex],
          [detailKey]: newDetailsArray,
        };

        const masterControl = this.formArray.at(masterIndex);
        if (masterControl) {
          masterControl.patchValue(this.model[masterIndex], { emitEvent: false });
        }
        this.dataSource.data = [...this.model];
        this.cd.detectChanges();
      }
    }
  }

  protected async onAddMaster(): Promise<void> {
    if (this.props['onAddMaster']) {
      const newData = await this.props['onAddMaster']();
      if (newData) {
        if (Array.isArray(newData)) {
          this.addNewMasterRows(newData);
        } else {
          this.add(this.model.length, newData);
        }

        const masterId = this.props['masterId'] || 'id';
        if (Array.isArray(newData)) {
          this.expandedIds.update((set) => {
            const newSet = new Set(set);
            newData.forEach((item) => newSet.add(item[masterId]));
            return newSet;
          });
        } else {
          this.expandedIds.update((set) => {
            const newSet = new Set(set);
            newSet.add(newData[masterId]);
            return newSet;
          });
        }
      }
    }
  }

  protected async onCancelDetail(masterIndex: number, detailIndex: number, currentData: any) {
    if (this.props['onCancelDetail']) {
      const masterData = this.model[masterIndex];
      const updatedDetail = await this.props['onCancelDetail'](currentData, detailIndex, masterData);
      if (updatedDetail) {
        this.onDetailUpdated(masterIndex, masterData, detailIndex, updatedDetail);
      }
    }
  }

  protected async onCancelMaster(index: number, currentData: any): Promise<void> {
    if (this.props['onCancelMaster']) {
      const updatedData = await this.props['onCancelMaster'](currentData, index);
      if (updatedData) {
        this.onMasterUpdated(index, updatedData);
      }
    }
  }

  protected async onDeleteDetail(masterIndex: number, detailIndex: number) {
    this.getDetailFormArray(masterIndex).removeAt(detailIndex);
    this.dataSource.data = [...this.model];
  }

  protected async onDeleteMaster(index: number): Promise<void> {
    this.remove(index);
  }

  protected async onEditDetail(masterIndex: number, detailIndex: number, currentDetail: any) {
    if (this.props['onEditDetail']) {
      const masterData = this.model[masterIndex];
      const updatedDetail = await this.props['onEditDetail'](currentDetail, detailIndex, masterData);
      if (updatedDetail) {
        this.onDetailUpdated(masterIndex, masterData, detailIndex, updatedDetail);
      }
    }
  }

  protected async onEditMaster(index: number, currentData: any): Promise<void> {
    if (this.props['onEditMaster']) {
      const updatedData = await this.props['onEditMaster'](currentData, index);
      if (updatedData) {
        this.onMasterUpdated(index, updatedData);
      }
    }
  }

  protected toggleRow(element: any, event: Event): void {
    event.stopPropagation();
    if (!this.showDetailIf()(element)) return;

    const masterId = this.props['masterId'] || 'id';
    const id = element[masterId];

    this.expandedIds.update((currentSet) => {
      const newSet = new Set(currentSet);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  private addNewMasterRows(newArray: any[]) {
    const masterId = this.props['masterId'] || 'id';
    const existingIds = new Set(this.model.map((item: any) => item[masterId]));

    const newRows = newArray.filter((item) => {
      const isNew = !existingIds.has(item[masterId]);
      return isNew && !!item[masterId];
    });

    newRows.forEach((newItem) => this.add(this.model.length, newItem));
  }

  private getDetailFormArray(masterIndex: number): FormArray {
    const masterControl = this.formArray.at(masterIndex) as FormGroup;
    let detailControl = masterControl.get(this.detailKey());

    if (!detailControl) {
      detailControl = new FormArray<any>([]);
      masterControl.addControl(this.detailKey(), detailControl);
    }

    return detailControl as FormArray;
  }

  private onDetailUpdated(masterIndex: number, masterData: any, detailIndex: number, updatedDetail: any): void {
    const detailKey = this.props['detailKey'] || 'details';
    const currentDetails = masterData[detailKey] || [];

    const newDetailsArray = currentDetails.map((item: any, idx: number) =>
      idx === detailIndex ? { ...item, ...updatedDetail } : item,
    );

    this.model[masterIndex] = {
      ...masterData,
      [detailKey]: newDetailsArray,
    };

    const masterControl = this.formArray.at(masterIndex);
    if (masterControl) {
      masterControl.patchValue(this.model[masterIndex], { emitEvent: false });
    }
    this.dataSource.data = [...this.model];
    this.cd.detectChanges();
  }

  private onMasterUpdated(index: number, updatedData: any): void {
    this.model[index] = { ...this.model[index], ...updatedData };
    this.formArray.at(index).patchValue(updatedData, { emitEvent: false });
    this.dataSource.data = [...this.model];

    const newDataArray = this.model.map((item: any, idx: number) => (idx === index ? { ...item } : item));

    this.dataSource.data = newDataArray;

    if (this.table) {
      this.table.renderRows();
    }

    this.cd.markForCheck();
  }
}
