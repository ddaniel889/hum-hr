import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Candidate } from '../../shared/models/Employee/candidate.model';
import { Person } from '../../shared/models/Employee/person.model';

@Component({
  selector: 'app-add-candidate-dialog',
  templateUrl: './add-candidate-dialog.component.html',
  styles: [
  ]
})
// AGREGA CANDIDATO O EMPLEADO
export class AddCandidateDialogComponent implements OnInit {
  isCandidate = false;
  tittle: string;
  constructor(private dialogRef: MatDialogRef<AddCandidateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Person
  ) {
    this.isCandidate = this.data instanceof Candidate;
    if (this.isCandidate) {
      this.tittle = 'Nuevo Candidato';
    } else {
      this.tittle = 'Nuevo Legajo';
    }
  }

  ngOnInit() {
  }

  closeAddPerson(needRefresh = false) {
    this.dialogRef.close(needRefresh);
  }
}







