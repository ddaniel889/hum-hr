import { Component, Inject, OnInit } from '@angular/core';
import { DocumentationTypesService } from '../services/documentation-types.service';
import { MessageService } from '../errorHandler/message.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DocumentationFind } from '../models/documentation-find.model';
import { ContainerTypeMetadata } from '../models/container-type.metadata.model';

@Component({
  selector: 'app-metadata-filter-dialog',
  templateUrl: './metadata-filter-dialog.component.html',
  styles: []
})
export class MetadataFilterDialogComponent implements OnInit {
  metadatas: ContainerTypeMetadata[];
  loading = true;
  showFilters = false;
  showRestrictionFilter = false;
  onlyViewFilter = false;
  documentationFind: DocumentationFind;
  enableEnhancedSearch: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    documentationFind: DocumentationFind,
    enableEnhancedSearch: boolean
  },
    private documentationTypesService: DocumentationTypesService,
    private dialogRef: MatDialogRef<MetadataFilterDialogComponent>,
    private msjService: MessageService) {
  }

  ngOnInit() {
    this.documentationFind = this.data.documentationFind;
    this.enableEnhancedSearch = this.data.enableEnhancedSearch;

    this.searchMetadatas();

    this.showFilters = this.documentationFind.restrictionFilter != null || this.documentationFind.filterNonViewed;

    if (this.documentationFind.sequence != null) {
      this.showRestrictionFilter = this.documentationFind.sequence.filter(s => s.requiredEmployeeSignature).length > 0;
      this.onlyViewFilter = this.documentationFind.sequence.filter(s => s.requiredViewEmployee).length > 0 && !this.showRestrictionFilter;
    }



  }

  toggleFilters() {
    if (this.showFilters) {
      this.documentationFind.restrictionFilter = null;
      this.documentationFind.filterNonViewed = false;
    }
  }

  close() {
    this.dialogRef.close();
  }

  cleanFilter() {
    this.documentationFind.metadatas = [];
    this.showFilters = false;
    this.documentationFind.restrictionFilter = null;
    this.documentationFind.filterNonViewed = false;
    this.searchMetadatas();
  }

  searchMetadatas() {
    this.metadatas = [];
    this.loading = true;
    this.documentationTypesService.getDocumentType(this.documentationFind.documentTypeId).toPromise().then(
      data => {
        if (data) {
          this.metadatas = data.metadata.filter(m => m.isSearchCriteria);
          this.ShowPeriodOverDate();
        }
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.msjService.showError('Error al obtener la información del tipo documental');
      }
    );

  }
  ShowNOFilter() {
    if (this.enableEnhancedSearch) {
      const moreMetadata = this.metadatas.filter(x => x.metadataSystemName != "_fecDoc").length;
      return moreMetadata === 0;
    } else {
      return this.metadatas.length === 0;
    }
  }

  ShowPeriodOverDate() {
    const fechaDocIndex = this.metadatas.findIndex(x => x.metadataSystemName === "_fecDoc");
    const hasPeriod = this.metadatas.some(x => x.metadataSystemName === "_peri");
    if (hasPeriod && fechaDocIndex !== 1) {
      this.metadatas.splice(fechaDocIndex, 1);
    }
  }
}
