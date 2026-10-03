import { Component, OnInit, Input, OnChanges, SimpleChanges, HostBinding } from "@angular/core";
import { FileService } from "../../shared/services/file.service";
import { PDFProgressData, PDFDocumentProxy, PDFSource } from 'ng2-pdf-viewer';
import { AuditService } from "../services/audit.service";
import { EmployeeProcess } from "../models";
import { FileDocument } from "../models/file-document.model";
import { HttpClient } from '@angular/common/http';
import { LsdService } from "../services/lsd.service";

@Component({
  selector: "app-pdf-wrapper",
  templateUrl: "./pdf-wrapper.component.html",
  styles: []
})
export class PdfWrapperComponent implements OnInit, OnChanges {
  @Input() file: string;
  @Input() fileId: number;
  @Input() fileName: string;
  @Input() showControls: boolean;
  @Input() process: EmployeeProcess;
  @Input() doc: FileDocument;
  @Input() autoView: boolean;
  @Input() showAll = true;
  @Input() fileBlob: Blob;
  @Input() autoSize: boolean = false;
  pdfSrc: any;
  signing: boolean;
  signable: boolean;
  loading = true;
  pdfZoom = 1;
  pdf: any;
  error: any;
  page = 1;
  isLoaded = false;
  progressData: PDFProgressData;
  size: number;
  blankPdf:string;

  constructor(
    private fileService: FileService,
    private auditService: AuditService,
    private http: HttpClient,
    private lsdServices: LsdService
  ) {

  }


  ngOnInit() {
    // Archivo PDF blanco para usar de fondo
    this.http.get('assets/blankPdf.txt', {responseType: 'text'}).toPromise().then(data => this.blankPdf = data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.file != null || this.fileBlob) {
      this.refreshPDF();
    }
  }

  private refreshPDF() {
    let blob;
    if (this.file != null) {
      const contentType = "application/pdf";
      if (this.file.length < 1 && !this.blankPdf){
        return;
      }

      blob = this.fileService.convertBase64ToBlob(this.file.length > 0 ? this.file : this.blankPdf, contentType);
    } else {
      blob = this.fileBlob;
    }
    this.size = blob.size;
    const blobURL = URL.createObjectURL(blob);
    this.pdfSrc = blobURL;
  }

  zoom(zoomSize: number) {
    const actualZoom = this.pdfZoom + zoomSize;
    if (actualZoom > 0) {
      this.pdfZoom = actualZoom;
    }
  }

  showAllPages() {
    this.showAll = true;
  }

  printpdf() {
    if (!document || !document.body) {
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = this.pdfSrc;
    document.body.appendChild(iframe);
    iframe.contentWindow.print();


    if (this.doc != null) {
      this.auditService.auditPrintEmployeeDocument(this.doc, this.autoView);
    } else if (this.process != null) {
      this.auditService.auditPrintPaycheck(this.process, this.autoView);
    }

  }

  saveFile() {
    if(this.fileService.isPDF(null, this.fileName))
    {
      if (!document || !document.body)
      {
        return;
      }
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = this.pdfSrc;
      a.download = this.fileName;
      a.click();
      a.remove();

      if (this.doc != null) {
        this.auditService.auditSaveEmployeeDocument(this.doc, this.autoView);
      } else if (this.process != null) {
        this.auditService.auditSavePaycheck(this.process, this.autoView);
      }
    }
     else{
    this.lsdServices.GetFileOriginal(this.fileId).
    subscribe(base64 =>
    {
        this.fileService.download(base64,this.fileName);
    });
  }
  }

  incrementPage(amount: number) {
    this.page += amount;
  }

  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
    this.isLoaded = true;
  }

  getInt(value: number): number {
    return Math.round(value);
  }

  onError(error: any) {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt('This document is password protected. Enter the password:');

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string) {
    let newSrc;

    if (this.pdfSrc instanceof ArrayBuffer) {
      newSrc = { data: this.pdfSrc };
    } else if (typeof this.pdfSrc === 'string') {
      newSrc = { url: this.pdfSrc };
    } else {
      newSrc = { ...this.pdfSrc };
    }

    newSrc.password = password;

    this.pdfSrc = newSrc;
  }

}
