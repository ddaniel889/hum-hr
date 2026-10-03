import { Component, OnInit, Input, EventEmitter, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-cs-paginator',
  templateUrl: './cs-paginator.component.html',
  styles: []
})
export class CsPaginatorComponent implements OnInit, OnChanges {
  @Input() pageCount: number;
  @Input() hidePageSize = true;
  @Input() hidePageSizeSelection = true;
  @Input() pageIndex: number;
  @Input() pageSize = 15;
  @Input() optionsPageSize = [15, 50, 100, 200];

  @Output() pageIndexChange = new EventEmitter();
  @Output() pageSizeChange = new EventEmitter();
  @Output() pageChanged = new EventEmitter<boolean>();
  @Output() pageSizeChanged = new EventEmitter<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  zeroBasedPageIndex: number;


  constructor() { }

  ngOnInit() {    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.zeroBasedPageIndex = this.pageIndex - 1;
  }

  selectedPageChanged(event) {
    this.zeroBasedPageIndex = this.paginator.pageIndex;
    this.pageIndex = this.zeroBasedPageIndex + 1;
    this.pageIndexChange.emit(this.pageIndex);
    this.pageSizeChange.emit(this.pageSize);
    this.pageChanged.emit();
  }

  setSizePage(): void {
    this.pageIndex = 1;
    this.pageSizeChange.emit(this.pageSize);
    this.pageSizeChanged.emit();
  }

}
