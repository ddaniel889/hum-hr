import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee } from '../../shared/models';

@Component({
  selector: 'app-share-person-response-dialog',
  templateUrl: './share-person-response-dialog.component.html',
  styles: [
  ]
})
export class SharePersonResponseDialogComponent implements OnInit {
  isCandidate = false;
  tittle = 'Nuevo Legajo';
  constructor(private dialogRef: MatDialogRef<SharePersonResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee) {
  }

  ngOnInit(): void {
  }

  closeAddPerson(isFinish = false) {
    this.dialogRef.close(isFinish);
  }
}
