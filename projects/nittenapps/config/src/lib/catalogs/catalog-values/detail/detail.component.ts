import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, EventEmitter, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { FaDuotoneIconComponent } from '@fortawesome/angular-fontawesome';
import { faPencil, faPlus } from '@fortawesome/pro-duotone-svg-icons';
import { ActivityService, ListBody, NAS_API_CONFIG } from '@nittenapps/api';
import { Catalog, CatalogValue } from '@nittenapps/common';
import { DetailToolbarComponent, Filter } from '@nittenapps/components';
import { catchError, map, merge, Observable, of, startWith, switchMap } from 'rxjs';

import { ValueComponent } from '../../value/value.component';

@Component({
  selector: 'nas-catalog-values-detail',
  standalone: true,
  imports: [
    DatePipe,
    DetailToolbarComponent,
    FaDuotoneIconComponent,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly faPencil = faPencil;
  readonly faPlus = faPlus;

  data!: CatalogValue[];
  displayedColumns: string[];
  totalItems: number = 0;

  _filter: { code?: string; name?: string } = {};

  private activityService: ActivityService<CatalogValue>;
  private catalog!: Catalog;
  private database!: CatalogValueDatabase;
  private filter: Filter = {};
  private route: ActivatedRoute;

  private dataChange = new EventEmitter<void>();
  private filterChange = new EventEmitter<void>();

  constructor(private dialog: MatDialog) {
    this.route = inject(ActivatedRoute);

    const apiConfig = inject(NAS_API_CONFIG);
    const http = inject(HttpClient);

    this.activityService = new ActivityService(apiConfig, http, 'configCatalogValues');

    this.displayedColumns = ['button', 'code', 'name', 'updatedBy', 'updatedOn'];
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.catalog = data['model'];
    });
  }

  ngAfterViewInit(): void {
    this.database = new CatalogValueDatabase(this.activityService);

    merge(this.sort.sortChange, this.filterChange).subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterChange, this.dataChange)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.database
            .getValues(
              this.catalog.id!,
              this.sort.active,
              this.sort.direction,
              this.paginator.pageIndex,
              this.paginator.pageSize,
              this.filter
            )
            .pipe(catchError(() => of({ total: 0, items: [] })));
        }),
        map((data) => {
          this.totalItems = data.total;
          return data.items;
        })
      )
      .subscribe((data) => (this.data = data));
  }

  addValue(): void {
    this.dialog
      .open(ValueComponent, {
        data: { catalog: this.catalog, value: { catalogCode: this.catalog.code, active: true } },
        width: '80%',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataChange.emit();
        }
      });
  }

  applyFilter(): void {
    const filter: Filter = {};
    if (this._filter.code) {
      filter['code'] = '%' + this._filter.code.toUpperCase() + '%';
    }
    if (this._filter.name) {
      filter['name'] = '%' + this._filter.name + '%';
    }
    this.filter = filter;
    this.filterChange.emit();
  }

  editValue(value: CatalogValue): void {
    this.dialog
      .open(ValueComponent, {
        data: { catalog: this.catalog, value: { catalogCode: this.catalog.code, ...value } },
        width: '80%',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.dataChange.emit();
        }
      });
  }
}

class CatalogValueDatabase {
  constructor(private activityService: ActivityService<CatalogValue>) {}

  getValues(
    catalogId: string,
    sort: string,
    order: SortDirection,
    page: number,
    pageSize: number,
    filter?: Filter
  ): Observable<ListBody<CatalogValue>> {
    return this.activityService
      .get<CatalogValue>('getValues', { catalogId, page, pageSize, sort: `${sort} ${order}`, ...filter })
      .pipe(map((response) => <ListBody<CatalogValue>>response.body));
  }
}
