import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Notification } from '../models/notification.model';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: []
})
export class TermsAndConditionsComponent implements OnInit, OnChanges {
  @Input() showPrint = true;
  @Input() showSave = true;
  @Input() showZoomIn = true;
  @Input() showZoomOut = true;
  @Input() termsAndConditions: Notification;
  filename = "terminos y condiciones.pdf";
  constructor() {
    (window as any).pdfWorkerSrc = '/assets/js/pdf.worker.js';
  }

  ngOnInit() {
  }

  showFile() {
    return (this.termsAndConditions && this.termsAndConditions.showFile);
  }

  ngOnChanges(changes: SimpleChanges): void {
  }
}
