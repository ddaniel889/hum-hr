import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrganizationalUnit } from '../../shared/models';
import { OrganizationalUnitService } from '../../shared/services/organizational-unit.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { DocumentationGroupData } from '../../shared/models/documentation-group-data.model';
import { FileDocumentSignMassiveDialogData } from '../../shared/models/file-document-sign-massive-dialog-data.model';
import { MatDialog } from '@angular/material/dialog';
import { FileDocumentSignMassiveDialogComponent } from '../../shared/file-document-sign-massive-dialog/file-document-sign-massive-dialog.component';
import { UiNotificationsService } from '../../shared/services/ui-notifications.service';
import { EmployerProcessService } from '../../shared/services/employer-process.service';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-documentation-signer',
  templateUrl: './documentation-signer.component.html',
  styles: [
  ]
})
export class DocumentationSignerComponent implements OnInit {
  selected = false;
  ouSelected: OrganizationalUnit;
  organizationalUnits: OrganizationalUnit[];
  ouTotalBatchs: number[] = [];
  fileDocumentBatchs: DocumentationGroupData[] = [];
  oufileDocumentBatchs: DocumentationGroupData[] = [];
  selectedBatch: DocumentationGroupData;
  loading = true;
  totalBatches = 0;
  isOpen = false;
  itemClass: string;
  disabledMassiveSing:boolean = false;
  countProcessMasiveSign = AppConfig.settings.application.countProcessMassiveSign;
  countProcessMasiveGroupSign = AppConfig.settings.application.countProcessMassiveGroupSign;
  ouGroup: OrganizationalUnit;
  constructor(
    private organizationalUnitService: OrganizationalUnitService,
    private msgService: MessageService,
    private fileDocumentSvc: FileDocumentService,
    private uiNotifSvc: UiNotificationsService,
    public dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private employerProcessService: EmployerProcessService
  ) { }

  ngOnInit(): void {
    this.organizationalUnitService.getTreeInMemory()
      .then(ous => {
        this.ouGroup = ous.find(x => x.isRoot);
        this.organizationalUnits = ous.filter(o => o.isRoot === false);
        this.organizationalUnitService.setCurrentOU(this.organizationalUnits[0]);
        const currentOu = this.organizationalUnitService.getCurrentOU();
        if (!currentOu || currentOu.isRoot) {
          this.ouSelected = this.organizationalUnits[0];
        } else {
          this.ouSelected = currentOu;
        }
       
        this.refresh();
      },
        err => this.msgService.showError(err)
      );
    
  }

  refresh() {
    this.loading = true;
    const loadings = [];
    for (let index = 0; index < this.organizationalUnits.length; index++) {
      const element = this.organizationalUnits[index];
      loadings.push(this.fileDocumentSvc.getDocumentationSignPending(element).toPromise());
    }

    this.fileDocumentBatchs = [];
    this.ouTotalBatchs = [];
    this.oufileDocumentBatchs = [];
    this.totalBatches = 0;
    

    let oldSelBatch: DocumentationGroupData;
    if (this.selectedBatch) {
      oldSelBatch = Object.assign([], this.selectedBatch);
      this.selectedBatch = undefined;
    }

    Promise.all(loadings).then(files => {
      for (let index = 0; index < this.organizationalUnits.length; index++) {
        this.fileDocumentBatchs = this.fileDocumentBatchs.concat(files[index]);
        this.ouTotalBatchs[index] = files[index].length;
        this.totalBatches += files[index].length;
      }
        this.ref.detectChanges();
        this.oufileDocumentBatchs = this.fileDocumentBatchs.filter(o => o.ou.id === this.ouSelected.id);

        if (oldSelBatch) {
          this.selectedBatch = this.getSelectedFileDocumentGroup(oldSelBatch);
        }
       })
      .catch(err => this.msgService.showError(err))
      .then(() => {
        this.validateOnGoingSignProccess();
      });
  }

  changeExpander(ou: OrganizationalUnit) {
    if (this.ouSelected === ou) {
      return;
    }

    this.ouSelected = ou;
    this.organizationalUnitService.setCurrentOU(ou);
    this.oufileDocumentBatchs = this.fileDocumentBatchs.filter(o => o.ou.id === this.ouSelected.id);
  }

  changeBatch(batch: DocumentationGroupData) {
    this.selectedBatch = batch;
    this.setIsOpen(true);
  }

  signAll(ou: OrganizationalUnit) {
    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = ou.id;
    dialogData.organizationalUnitName = ou.name;

    const dialogRef = this.dialog.open(FileDocumentSignMassiveDialogComponent, {
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Y aca?
      this.uiNotifSvc.refreshNotifiationProcess();
      this.refresh();
    });
  }

  signBatch(batch: DocumentationGroupData) {

    const dialogData = new FileDocumentSignMassiveDialogData();
    dialogData.organizationalUnitId = batch.ou.id;
    dialogData.organizationalUnitName = batch.ou.name;
    dialogData.documentationId = batch.documentationId;
    dialogData.documentationName = batch.documentationName;
    dialogData.documentationDate = batch.documentationDate;
    const dialogRef = this.dialog.open(FileDocumentSignMassiveDialogComponent, {
      data: dialogData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      let sendToSign = result != false && (result.sendToSign == true || result.sendToSign == null) ? true : false;

      this.uiNotifSvc.refreshNotifiationProcess(false, false, sendToSign);
      this.refresh();
    });
  }

  private getSelectedFileDocumentGroup(batch: DocumentationGroupData): DocumentationGroupData {
    const selected = this.oufileDocumentBatchs.filter(o => o.countDocuments === batch.countDocuments && o.ou.id === batch.ou.id && o.documentationId === batch.documentationId);
    return selected[0];
  }

  detailClass(): string {
    if (this.isOpen) {
      return 'is-open';
    } else {
      return '';
    }
  }

  setIsOpen(value) {
    this.isOpen = value;
  }

   changeDetailClass(detailClass: string) {
    this.itemClass = detailClass;
  }
  validateOnGoingSignProccess()
  {    
    const loadings = [];
    
    if(this.ouGroup)
      {
       this.employerProcessService.getPendingSignProcess(this.ouGroup.id, this.countProcessMasiveGroupSign).toPromise().then(result => {           
        this.disabledMassiveSing = result.length >= this.countProcessMasiveGroupSign; 
       if(!this.disabledMassiveSing)
       {
         this.organizationalUnits.forEach(element => {
            loadings.push(this.employerProcessService.getPendingSignProcess(element.id, this.countProcessMasiveSign).toPromise());
         });
         Promise.all(loadings).then(process => {
           for (let index = 0; index < this.organizationalUnits.length; index++) {
             this.organizationalUnits[index].usedisabledProcessMasiveSign = process[index].length >= this.countProcessMasiveSign;
           }
           this.loading = false;
         });
        
       }      
       else{this.loading = false;}  
       });       
     }
     else
     {
       this.organizationalUnits.forEach(element => {
         loadings.push(this.employerProcessService.getPendingSignProcess(element.id, this.countProcessMasiveSign).toPromise());
      });
      Promise.all(loadings).then(process => {
        for (let index = 0; index < this.organizationalUnits.length; index++) {
          this.organizationalUnits[index].usedisabledProcessMasiveSign = process[index].length >= this.countProcessMasiveSign;
        }
        this.loading = false;
      });
     }       
  }
}
