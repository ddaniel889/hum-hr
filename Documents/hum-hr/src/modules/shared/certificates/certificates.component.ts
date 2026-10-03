import { Component, OnInit, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MessageService } from "../errorHandler/message.service";
import { CertificateService } from "../services/certificate.service";
import { Certificate, CertificateType } from "../models/certificate.model";

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: []
})
export class CertificatesComponent implements OnInit, OnChanges {
  certificates: Certificate[];
  @Input() isRRHH: boolean;
  @Input() userId: number;
  @Input() expanded: boolean;
  @Input() enableAdd = false;
  @Input() hasTitle = true;
  @Input() employeeId: number = null;
  loading = false;
  isCertificateDeclarationOpen = false;
  documentIds: number[] = [];

  constructor(
    private msjService: MessageService,
    private certificateService: CertificateService
  ) {
    this.certificates = [];

  }

  ngOnInit() {
  }

  refresh() {
    this.getCertificates(this.userId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.documentIds = [this.employeeId];
    this.refresh();
  }

  getCertificates(id: number) {
    this.loading = true;
    const typeId = this.isRRHH ? CertificateType.Employer : CertificateType.Employee;
    this.certificateService.getCertificates(id,typeId).subscribe(
      res => {
        if (res && id === this.userId) {         
          this.certificates = res.filter(cert => cert.typeId == typeId && cert.enabled == true);
          this.loading = false;
        }
      },
      err => {
        if (err && err.code && err.code === 'No user valid') {
          // Evito el Invalid user porque es un error de buscar el usuario anterior
          return;
        }
        this.msjService.showError(err);
      }
    );
  }

  openAdd() {
    this.isCertificateDeclarationOpen = true;
  }

  closeAdd() {
    this.isCertificateDeclarationOpen = false;
    this.refresh();
  }

}
