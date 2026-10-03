import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeProcessService } from "../../shared/services/employee-process.service";
import { EmployeeProcess } from "../../shared/models";
import { FileService } from "../../shared/services/file.service";
import { MessageService } from "../../shared/errorHandler/message.service";

@Component({
  selector: "app-document-detail",
  templateUrl: "./document-detail.component.html",
  styles: []
})
export class DocumentDetailComponent implements OnInit {
  @Output() close = new EventEmitter<boolean>();
  process: EmployeeProcess;
  pdfSrc: any;
  signing: boolean;
  signable: boolean;
  loading = true;
  filePdf = "";
  fileName = "";
  processId: string;
  isOpen = true;

  constructor(
    private route: ActivatedRoute,
    private employeeProcessService: EmployeeProcessService,
    private fileService: FileService,
    private msjService: MessageService,
    private router: Router
  ) {
    this.route.params.subscribe(params => {
      this.signing = false;
      this.signable = false;
      this.processId = params["id"];
      this.getProcessDetail();
    });
  }

  ngOnInit() {
  }

  getProcessDetail() {
    this.loading = true;
    this.pdfSrc = undefined;

    this.employeeProcessService
      .getProcessDetail(this.processId)
      .toPromise()
      .then(
        data => {
          this.process = data;

          if (this.process.isViewPending()) {
            this.employeeProcessService
              .execute(this.processId)
              .toPromise()
              .then(
                proc => {
                  this.process = proc;
                  this.employeeProcessService.refreshOneProcess(this.process);
                },
                err => this.msjService.showError(err)
              );
          } else {
            this.employeeProcessService.refreshOneProcess(this.process);
          }

          this.fileService
            .getEmployeeProcessFileById(this.process.getFileId())
            .toPromise()
            .then(
              file => {
                this.signable = data.stateDescription === null;
                this.filePdf = file;
                this.fileName = `${data.employeeFile} - ${data.periodValue} - ${data.typeValue} - ${data.stateAlias} [${data.getFileCreationDate(0)}].pdf`;
                this.loading = false;
                this.msjService.close();
              },
              err => this.msjService.showError(err)
            );

        },
        err => {
          if (err.code === "WFPROF001") {
            this.router.navigate(['welcome'], { relativeTo: this.route });
          }
          this.msjService.showError(err);
        }
      );
  }

  signingChanged(signingChange: boolean) {
    this.signing = signingChange;
  }

  reloadDocument() {
    this.getProcessDetail();
  }


  documentClose() {
    this.isOpen = false;
    this.router.navigate(['welcome'], { relativeTo: this.route });
  }
}
