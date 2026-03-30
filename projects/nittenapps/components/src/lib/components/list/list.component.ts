import { NgClass, DecimalPipe, DatePipe, PercentPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  numberAttribute,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ApiConfig, NAS_API_CONFIG } from '@nittenapps/api';
import { interval, merge, Observable, startWith, Subscription, tap } from 'rxjs';

import { ListDataSource } from '../../datasources/list.datasource';
import { ListStateService } from '../../services/list-state.service';
import { Column, Filter } from '../../types';

/** Tabla reutilizable para renderizar data por medio del activity con paginación, orden y filtros. */
@Component({
    selector: 'nas-list',
    imports: [
        DatePipe,
        DecimalPipe,
        FaIconComponent,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        NgClass,
        PercentPipe,
    ],
    templateUrl: './list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent<T> implements AfterViewInit, OnChanges, OnDestroy, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<T>;

  @Input() activeSort?: string;
  @Input() activeSortDirection: SortDirection = 'asc';
  @Input({ transform: numberAttribute }) autorefresh?: number;
  @Input({ required: true }) activity!: string;
  @Input() baseObject!: T;
  @Input({ required: true }) columns!: Column[];
  @Input() emptyMessage: string = 'No se encontraron registros';
  @Input() filter?: Filter;
  @Input() objectId: string = 'id';
  @Input() openUrl: boolean = false;
  @Input() rowClass?: string | string[] | ((item: any) => string | string[]);

  @Output() filterChange = new EventEmitter<Filter>();

  dataSource!: ListDataSource<T>;
  displayedColumns: string[] = [];
  pageIndex: number = 0;
  pageSize: number = 15;

  private _filterChange = new EventEmitter<void>();
  private _subscription$?: Subscription;

  constructor(
    @Inject(NAS_API_CONFIG) private apiConfig: ApiConfig,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private stateService: ListStateService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      const state = this.stateService.get(this.activity);
      this.pageIndex = state.p;
      this.pageSize = state.s;
      this.filter = state.f || {};
      this.stringToSort(state.o?.[0] || this.activeSort);

      merge(this.sort.sortChange, this._filterChange).subscribe(() => (this.paginator.pageIndex = 0));

      let merged: Observable<unknown>;
      if (this.autorefresh) {
        merged = merge(interval(this.autorefresh), this.sort.sortChange, this.paginator.page, this._filterChange);
      } else {
        merged = merge(this.sort.sortChange, this.paginator.page, this._filterChange);
      }

      this._subscription$ = merged
        .pipe(
          startWith({}),
          tap(() => {
            this.dataSource.loadItems(
              this.paginator.pageIndex,
              this.paginator.pageSize,
              this.sort.active ? `${this.sort.active} ${this.sort.direction}` : undefined,
              this.filter
            );
          })
        )
        .subscribe();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const prop in changes) {
      if (prop === 'filter') {
        this._filterChange.emit(changes[prop].currentValue);
      }
    }
  }

  ngOnDestroy(): void {
    this._subscription$?.unsubscribe();
    this.stateService.save(
      this.activity,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.sortToString(),
      this.filter
    );
  }

  ngOnInit(): void {
    this.dataSource = new ListDataSource(this.apiConfig, this.http, this.activity);
    this.displayedColumns = this.columns.map((column) => column.id);
  }

  getClass(column: Column, item: T): string | string[] {
    if (typeof column.class === 'function') {
      return column.class(column.id, item);
    }
    return column.class || '';
  }

  getIcon(column: Column, item: T): IconProp | undefined {
    if (typeof column.icon === 'function') {
      return column.icon(column.id, item);
    }
    return column.icon;
  }

  getNumberValue(column: Column, item: T): number | undefined {
    return this.getValue(column, item) as number;
  }

  getRowClass(item: T): string | string[] | undefined {
    if (typeof this.rowClass === 'function') {
      return this.rowClass(item);
    }
    return this.rowClass;
  }

  getValue(column: Column, item: T): string | number | Date | undefined {
    if (typeof column.value === 'function') {
      return column.value(column.id, item);
    } else if (!!column.value) {
      return column.value;
    } else if (!!column.field) {
      const keys = column.field.split('.');
      var value = item;
      keys.forEach((key) => {
        if (value) {
          value = (value as any)[key];
        }
      });
      if (typeof value === 'object') {
        return JSON.stringify(value);
      } else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        return value;
      }
      return undefined;
    } else {
      return (item as any)[column.id];
    }
  }

  showItem(item: T): void {
    if (this.openUrl) {
      window.open((item as any).url, '_blank');
      return;
    }
    this.router.navigate([(item as any)[this.objectId]], { relativeTo: this.route });
  }

  private sortToString(): string[] {
    let sort: string[] = [];
    if (this.sort.active && this.sort.direction) {
      sort.push(this.sort.active + ' ' + this.sort.direction);
    } else if (!!this.activeSort) {
      sort.push(this.activeSort);
    }
    return sort;
  }

  private stringToSort(sort?: string): void {
    if (sort) {
      const parts = sort.split(' ');
      this.activeSort = parts[0];
      if (parts.length > 1) {
        this.activeSortDirection = parts[1] as SortDirection;
      }
    }
  }
}
