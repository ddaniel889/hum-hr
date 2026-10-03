import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { DialogOptions } from '../models/dialogOptions.model';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: []
})


export class DialogComponent implements OnInit {
YesNoCancel = DialogOptions.YesNoCancel;


  constructor(
    private bottomSheetRef: MatBottomSheetRef<DialogComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  ngOnInit() {

  }

  cancel(): void {
    if (this.data.option == DialogOptions.YesNoCancel) {
      this.bottomSheetRef.dismiss(null);
    } else {
      this.bottomSheetRef.dismiss(false);
    }

  }

  no(): void {
    this.bottomSheetRef.dismiss(false);
  }

  ok() {
    this.bottomSheetRef.dismiss(true);
  }
}
