import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ViewChild, AfterViewChecked } from '@angular/core';
import { ContainerType } from '../models';
import { MetadataFind } from '../models/metadata.model';
import { EmployeeFind } from '../models/employee-find.model';
import { AdvancedEmployeeFilters } from '../models/Employee/advanced-employee-filters';
import { SegmentEmployeeFind } from '../models/segment-employee-find.model';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-advanced-employee-search',
  templateUrl: './advanced-employee-search.component.html',
  styles: []
})
export class AdvancedEmployeeSearchComponent implements OnInit, AfterViewChecked, OnChanges {
  @ViewChild("advSearchTab") advSearchTab: MatTabGroup;
  @Input() filters: AdvancedEmployeeFilters;
  @Input() containerType: ContainerType;
  @Input() uniqueOption = false;
  @Input() isEmployee = true;
  @Output() OnFilter = new EventEmitter();
  @Output() hideFilter = new EventEmitter();
  placeHolderDescription = "";
  segmentList: SegmentEmployeeFind[];
  showSegmentTab = true;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewChecked() {
    if (this.advSearchTab) {
      this.advSearchTab.realignInkBar();
    }
  }

  ngOnChanges(changes) {
    if ((!this.segmentList || changes.containerType) && this.containerType) {
      this.getSegments();
    }
  }

  getSegments() {
    this.segmentList = [];
    this.placeHolderDescription = "";

    if (!this.filters || !this.filters.selectedEmployeeFind) {
      this.filters.selectedEmployeeFind = [];
    }
    const metas = this.containerType.metadata.filter(m => m.isSearchCriteria);    
    metas.forEach(meta => {
      if (meta.optionValues) {
        const options: any[] = JSON.parse(meta.optionValues.toString());
        this.placeHolderDescription = this.placeHolderDescription === '' ? meta.metadataLabel : this.placeHolderDescription.concat(', ', meta.metadataLabel);

        options.forEach(opt => {
          const desc = opt.description ? opt.description : opt.value;          
          const segmentEmployeeFind = new SegmentEmployeeFind(opt.value, meta.metadataLabel + ': ' + desc, meta.metadataSystemName);          
          var segment = this.filters.selectedEmployeeFind.find(x => x.metadata.MetadataValueFrom == opt.value);          
          if (segment == undefined)
          {
             this.segmentList.push(segmentEmployeeFind);
          }
        });
      }
    });
    this.showSegmentTab = this.segmentList.length > 0;
    this.placeHolderDescription = 'Ingrese ' + this.placeHolderDescription;    
    this.switchSearchType();
  }

  filteredSearch() {
    this.OnFilter.emit();
  }

  notFiltering() {
    this.hideFilter.emit();
  }

  selectEmployeeFind(employeeName) {    
    const foundEmployee = this.segmentList.filter(dt => dt.name == employeeName);
    if (foundEmployee.length) {
      this.segmentList = this.segmentList.filter(dt => dt.name != employeeName);
      const meta: MetadataFind = {
        MetadataSearchTypeFrom: 'Equal',
        MetadataSearchTypeTo: 'Equal',
        MetadataSystemName: foundEmployee[0].systemName,
        MetadataValueFrom: foundEmployee[0].id,
        MetadataValueTo: null,
        Nullvalue: false,
        metadataIsMultivalue: false
      };

      const employeeFind = new EmployeeFind(0, foundEmployee[0].name, meta);
      this.filters.selectedEmployeeFind.push(employeeFind);
      this.switchSearchType();
    }
  }

  switchSearchType() {
    this.filters.segmentSearch = this.advSearchTab != null ? (this.advSearchTab.selectedIndex === 0 && this.showSegmentTab): true;

    if (this.filters.segmentSearch) {
      if (this.filters.cuilSearch || this.filters.nroLegSearch){
        this.advSearchTab.selectedIndex = 1;
      } else {
        this.filters.cuilSearch = undefined;
        this.filters.nroLegSearch = undefined;
      }
    } else {
      this.filters.selectedEmployeeFind = [];
    }
  }

  errorStatus() {
    return !this.filters.activeSearch && !this.filters.inactiveSearch;
  }

  errorsCandidate(){
    return this.errorStatus();
  }
  removeItem(item: any)
  {
    this.getSegments();
     
  }
}
