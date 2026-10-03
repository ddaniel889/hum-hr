import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee } from '../../shared/models';
import { Person } from '../../shared/models/Employee/person.model';

@Component({
  selector: 'app-add-documentation-dialog',
  templateUrl: './add-documentation-dialog.component.html',
  styles: []
})
export class AddDocumentationDialogComponent implements OnInit {
  selectedPerson: Employee;
  isCandidate: Boolean;

  constructor(private dialogRef: MatDialogRef<AddDocumentationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

  ngOnInit(): void {
    this.selectedPerson=  this.data.selectedPerson ;
  }
  closeDialog() {
    this.dialogRef.close();
  }

}



