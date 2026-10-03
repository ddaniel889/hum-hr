import { Component, OnInit, Inject, Input, HostListener, Output, EventEmitter } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FileService } from "../../shared/services/file.service";
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { PdfWrapperComponent } from '../../shared/pdf-wrapper/pdf-wrapper.component';


@Component({
  selector: "app-pdf-wrapper-controls",
  templateUrl: "./pdf-wrapper-controls.component.html",
  styles: []
})
export class PdfWrapperControlsComponent implements OnInit {
  @Input() pdfWrapper: PdfWrapperComponent;
  @Input() showPrint = true;
  @Input() showSave = true;
  @Input() showZoomIn = true;
  @Input() showZoomOut = true;
  @Input() showRemove = false;
  @Input() disabled = false;
  @Output() OnRemoveFile = new EventEmitter<boolean>();
  pdfSrc: any;
  signing: boolean;
  signable: boolean;
  loading = true;
  pdfZoom = 1;
  pdf: any;
  error: any;
  page = 1;
  isLoaded = false;
  size: number;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService
  ) {
  }

  ngOnInit() {
  }

  zoom(zoomSize: number) {
    this.pdfWrapper.zoom(zoomSize);
  }

  printpdf() {
    this.pdfWrapper.printpdf();
  }

  removeFile() {
    this.OnRemoveFile.emit(true);
  }

  showPages() {
    this.pdfWrapper.showAllPages();
  }

  saveFile() {
    this.pdfWrapper.saveFile();
  }

  incrementPage(amount: number) {
    this.pdfWrapper.incrementPage(amount);
  }

  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdfWrapper.afterLoadComplete(pdf);
  }

  getInt(value: number): number {
    return Math.round(value);
  }

  onError(error: any) {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt('Por favor ingrese la contraseña para el documento:');

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string) {
    let newSrc;

    if (this.pdfSrc instanceof ArrayBuffer) {
      newSrc = {data: this.pdfSrc};
    } else if (typeof this.pdfSrc === 'string') {
      newSrc = {url: this.pdfSrc};
    } else {
      newSrc = {...this.pdfSrc};
    }

    newSrc.password = password;

    this.pdfSrc = newSrc;
  }

}
