import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, TemplateRef } from "@angular/core";
import { SelectionType, DatatableComponent } from "@swimlane/ngx-datatable";
import { MaskApplierService } from "ngx-mask";

@Component({
  selector: "app-cs-grid-control",
  templateUrl: "./cs-grid-control.component.html",
  styles: []
})
export class CsGridControlComponent implements OnInit, OnChanges {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('dateColumn') dateColumn: TemplateRef<any>;
  @ViewChild('actionsColumn') actionsColumn: TemplateRef<any>;
  @ViewChild('statusColumn') statusColumn: TemplateRef<any>;
  @ViewChild('setConfigurated') setConfigurated: TemplateRef<any>;
  @Output() sortColumn = new EventEmitter<any>();
  @Output() changePage = new EventEmitter<number>();
  @Output() executeFunction = new EventEmitter<any>();
  @Output() selectFunction = new EventEmitter<any>();
  @Input() items: any[];
  @Input() columns = [];
  @Input() itemsCount = 0;
  @Input() pageSize = 0;
  @Input() currentPage = 0;
  @Input() loading = false;
  @Input() selectedItems = [];
  sorts = {};
  selected = [];
  SelectionType = SelectionType;
  event: any;
  doPage = false;
  scrollTimeout: any;

  constructor(
    private maskApplierService: MaskApplierService,

  ) {
  }

  ngOnInit() {
    if (this.columns.length < 1) {
      return;
    }

    const sortedColumn = this.columns.filter(col => col.dir != null)[0];
    if (sortedColumn && sortedColumn.dir) {
      this.sorts = { prop: sortedColumn.prop, dir: sortedColumn.dir };
    } else {
      this.sorts = { prop: this.columns[0].prop };
    }
  }

  ngOnChanges() {
    this.setColumnsTemplates();
    this.mapItems();
  }

  onSort(event) {
    this.sortColumn.emit({ orderAsc: event.newValue === 'asc', orderBy: event.column.prop });
  }

  justPage(pageInfo) {
    if (!this.doPage) {
      this.changePage.emit(pageInfo.offset);
    }
  }

  avoidUpdate() {
    this.doPage = true;

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.doPage = false;
    }, 100);
  }



  onSelect({ selected }) {
    this.selectedItems.splice(0, this.selectedItems.length);
    this.selectedItems.push(selected);
    this.selectFunction.emit(this.selected[this.selected.length - 1]);
  }

  refreshTable() {
    if (this.table) {
      this.table.recalculate();
      this.delay(210).then(() => {
        if (this.table) {
          this.table.recalculate();
          this.table.activate.emit(this.event);
        }
      });

    }
  }

  onActivate(event: any) {
    if (!this.event) {
      this.event = event;
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  execFunction(action: any, row: any) {
    if (action.param) {
      const param = typeof (action.param) === 'object' ? action.param : this.getItemPropertyByName(row, action.param);

      this.executeFunction.emit({ method: action.method, param: param });
    }
  }

  mapItems() {
    this.items.forEach(item => {
      this.columns.forEach(c => {
        const foundValue = item.getMetadataValue(c.prop);
        if (foundValue) {
          item[c.prop] = c.mask ? this.maskApplierService.applyMask(foundValue, this.maskSplited(c.mask)) : foundValue;
        }
      });
    });
  }

  maskSplited(mask:string):string{    
    let masksplited= mask.split("||")
     if (masksplited.length>1) {
       //Las mascaras de Id Fiscales cuando son mas de una por pais, al ser de distintas longitudes y estar ordenadas de menor a mayor longitud, 
       //siempre elijo la mayor que queda en la ultima posicion del arreglo
       let i=masksplited.length-1;
       return masksplited[i];
     };
     return mask
   }

  setColumnsTemplates() {
    this.columns.forEach(c => {
      if (c.cellTemplate != null) {
        if (c.cellTemplate == 'dateColumn') {
          c.cellTemplate = this.dateColumn;
        } else if (c.cellTemplate == 'statusColumn') {
          c.cellTemplate = this.statusColumn;
          c.cellClass = 'candidate-status_bar';
        } else if (c.cellTemplate == 'actionsColumn') {
          c.cellTemplate = this.actionsColumn;
          c.headerClass = 'actions-cell';
          c.cellClass = 'actions-cell';
        } else if (c.cellTemplate == 'setConfigurated') {
          c.cellTemplate = this.setConfigurated;
        }
      }
    });
  }

  getItemPropertyByName(item: any, value: string) {
    let result;
    Object.keys(item).forEach(k => {
      if (k === value) {
        result = item[k];
      }
    });
    return result;
  }

  getRowClass(row) {
    return {
      'row-cancel': !row.isActive
    };
  }

}


