import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input, ViewChild, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';
import { FormioComponent, FormioService, FormioForm } from '@formio/angular';
import { AppConfig } from 'src/app/app.config';
import { FileDocument } from '../shared/models/file-document.model';
import {  Formio } from 'formiojs';

@Component({
  selector: "app-formio-cardinal",
  templateUrl: "./formio-cardinal.component.html",
  styleUrls: ["./cardinal-formio.css",
    "../../../../node_modules/bootstrap/dist/css/bootstrap.min.css",
    "../../../assets/styles/fontAwesomeBootstrap.css"
  ],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class FormioCardinalComponent implements OnInit {

  @Output() submitted = new EventEmitter<any>();
  @Input() formName: string;
  @Input() haveCloseAction = false;
  @Input() fileDocument: FileDocument;

  @ViewChild('formio', { static: true }) formio: ElementRef;
  source: string;
  service: FormioService;
  showForm = false;
  formioForm: any;

  constructor() { }

  ngOnInit() {
    this.showForm = this.formName != undefined;
    this.formioForm = {};
    let docData;

    if (this.fileDocument) {
      docData = this.fileDocument.getFormiData().reduce(function (result, item) {
        const key = Object.keys(item)[0];
        result[key] = item[key];
        return result;
      });
    }

    let formioConfig: string;
    if (!AppConfig.settings.application.formStage || AppConfig.settings.application.formStage.length < 1) {
      formioConfig = `https://${AppConfig.FormioAppConfig.appUrl}`;
    } else {
      formioConfig = `https://${AppConfig.settings.application.formStage}-${AppConfig.FormioAppConfig.appUrl}`;

    }
    Formio.createForm(this.formio.nativeElement, `${formioConfig}/${this.formName}`, {
      readOnly: false,
      language: 'es',
      i18n: {
        es: {
          Submit: 'Finalizar',
          complete: 'Generando archivo...',
          error : "Por favor corrija los siguientes errores.",
          invalid_date :"{{field}} no es un fecha valida.",
          invalid_email : "{{field}} debe ser un email valido.",
          invalid_regex : "{{field}} no coincide con el patrón {{regex}}.",
          mask : "{{field}} no coincide con la máscara.",
          max : "{{field}} no puede ser mas grande que {{max}}.",
          maxLength : "{{field}} debe tener menos de {{length}} caracteres.",
          min : "{{field}} no puede ser menor a {{min}}.",
          minLength : "{{field}} debe tener mas de {{length}} caracteres.",
          next : "Siguiente",
          pattern : "{{field}} no coincide con el patrón {{pattern}}.",
          previous : "Anterior",
          required : "{{field}} es requerido."
        }
      }
    }).then(formulario => {
      if (this.fileDocument) {
        // Defaults are provided as follows.
        formulario.submission = {
          data: docData
        };
      }


      this.formioForm = formulario;
      formulario.on('submit', (submission) => {
        this.onSubmit(submission);
      });
    });

  }

  submitForm() {
    const result = this.formioForm.submit();
    result.catch(e => {
      this.submitted.emit(false);
    });
  }


  onSubmit(submission: any) {
    this.submitted.emit(submission);
  }

}
