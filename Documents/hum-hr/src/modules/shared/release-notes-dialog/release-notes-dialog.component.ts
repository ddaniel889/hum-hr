import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-release-notes-dialog',
  templateUrl: './release-notes-dialog.component.html',
  styles: []
})
export class ReleaseNotesDialogComponent implements OnInit {
  content: string;
  html = '';
  path = 'assets/release-notes/release-notes.html';

  constructor(@Inject(MAT_DIALOG_DATA)
  private dialogRef: MatDialogRef<ReleaseNotesDialogComponent>,
    private http: HttpClient) { }

  ngOnInit() {
    const headers = new HttpHeaders().set('Content-Type', 'text/html');

    this.http.get(this.path, { headers, responseType: 'text' }).subscribe(
      data => {
        this.html = data;
      });
  }
}
