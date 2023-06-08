import { FormatColumn, TableFilter } from 'src/app/helpers/interface';
import { FormControl } from '@angular/forms';
import { DatatableService } from './datatable.service';
import { Component, OnInit, Input, ViewChild, SimpleChanges, AfterViewInit, OnChanges, ChangeDetectorRef, AfterViewChecked, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { ExcelAdapter } from 'src/app/helpers/utilities/excel-adapter';

export interface APIRespDatatable {
  items: Array<any>;
  total_count: number;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {
  @ViewChild(MatTable) table: MatTable<any>;

  @Input() columnDefs: FormatColumn[];
  @Input() columnSort: string;
  @Input() columnDirection = 'desc';
  @Input() service: string;
  @Input() filters: TableFilter;
  @Input() isSelectable = false;
  @Input() mode = 1;
  @Input() isUpdated = false
  @Input() isDeleted = false

  // Parameter export
  @Input() allowExport = false;
  @Input() dataExport: Partial<any>[] = [];
  @Input() nameExport: string;

  @Output() dataSelected = new EventEmitter<any>();

  displayedColumns: string[];
  dataSource = new MatTableDataSource<any>();
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  selectedId = -1;
  search = new FormControl('');
  searchValue = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private datatableService: DatatableService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters && !changes.filters.firstChange) {
      this.paginator.pageIndex = 0;
    }

    if (changes.columnDefs) {
      this.displayedColumns = this.columnDefs.map(x => x.title);
    }
  }

  ngAfterViewInit() {
    if (this.mode == 1) {
      this.loadData();
    } else {
      this.loadDataWithItems([]);
    }

    this.paginator._intl.itemsPerPageLabel = 'Eléments par page:';
    this.paginator._intl.nextPageLabel = 'Page suivante';
    this.paginator._intl.previousPageLabel = 'Page précédente';
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  get Data() {
    return this.dataSource;
  }

  loadData(filter: any = this.filters) {
    this.filters = filter;

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    this.search.valueChanges.subscribe(value => {
      this.paginator.pageIndex = 0;
      this.filters.search = value;
    });

    merge(this.sort.sortChange, this.paginator.page, this.search.valueChanges)
      .pipe(
        debounceTime(1000),
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.datatableService.getDataForTable(
            this.service,
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.filters
          );
        }),
        map((data: APIRespDatatable) => {
          // console.log(data);
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          this.dataExport = data.items;
          return data.items;
        }),
        catchError((e) => {
          // console.log(e);
          this.isLoadingResults = false;
          this.isRateLimitReached = true;
          return of([]);
        })
      ).subscribe(data => this.dataSource.data = data);
  }

  loadDataWithItems(data: any) {
    this.isRateLimitReached = false;
    this.isLoadingResults = false;
    this.dataSource.data = data;
    this.dataExport = data;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.resultsLength = data.length;
    this.paginator.pageIndex = 0;
  }

  emitData(data) {
    this.dataSelected.emit(data)
  }

  selectRow(event) {
    this.dataSource.data.forEach(element => element.active = false);

    if (this.selectedId === event.id) {
      this.selectedId = -1;
      this.emitData({ data: null })
    } else {
      event.active = true;
      this.selectedId = event.id;
      this.emitData({ data: event })
    }
  }

  resetDisplayTable() {
    this.dataSource.data.forEach(item => { item.active = false; });
    this.selectedId = -1;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;

    if (this.mode === 1) {
      this.searchValue = filterValue.trim().toLowerCase();
    } else {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  refresh() {
    if (this.mode === 1) {
      this.loadData();
    } else {
      this.loadDataWithItems(this.dataSource.data);
    }
  }

  exportTable() {
    ExcelAdapter.arrayToExcel(this.dataExport, this.nameExport);
  }

  takeAction(row, action: string) {
    this.emitData({ data: row, action });
  }
}
