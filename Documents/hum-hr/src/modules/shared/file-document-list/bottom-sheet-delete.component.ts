import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FileDocumentService } from '../../shared/services/file-document.service';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-bottom-sheet-delete',
  templateUrl: 'bottom-sheet-delete.html',
})
export class BottomSheetDeleteComponent implements OnInit {
  @Output() close = new EventEmitter<boolean>();

  constructor(
       private bottomSheetRef: MatBottomSheetRef<BottomSheetDeleteComponent>) { }

  cancel() {
    this.close.emit(false);
    this.bottomSheetRef.dismiss();
  }

  ngOnInit() {
  }

  onClose(): void {
    this.close.emit(true);
    this.bottomSheetRef.dismiss();
  }
}
