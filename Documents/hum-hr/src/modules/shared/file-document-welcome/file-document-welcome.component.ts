import { AppConfig } from '../../../app.config';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-document-welcome',
  templateUrl: './file-document-welcome.component.html',
  styles: []
})
export class FileDocumentWelcomeComponent implements OnInit {
  urlHelp: string;
  constructor() {
    this.urlHelp = AppConfig.settings.custom.employerHelpUrl;
  }

  ngOnInit() {
  }

}
