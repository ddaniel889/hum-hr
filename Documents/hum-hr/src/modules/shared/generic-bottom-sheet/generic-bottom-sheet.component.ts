import { Component, OnInit, EventEmitter, Output, Input, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MessageAtributtes, MessageType } from '../models/message-types.model';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-generic-bottom-sheet',
  templateUrl: './generic-bottom-sheet.component.html',
  styles: []
})
export class GenericBottomSheetComponent implements AfterViewInit, OnInit {
  @Output() close = new EventEmitter<any>();
  @ViewChild('codeInput') private elementRef: ElementRef;

  showHelp = false;
  code: string;
  codeGenerated: string;
  isMatching = true;
  textArea = '';
  durationFormLeave: UntypedFormGroup;
  StartDate: UntypedFormControl;
  EndDate: UntypedFormControl;
  MinDate:Date;
  MaxDate:Date;
  HastaMinDate: Date;
  fechaInicio: Date;
  fechaFin: Date;
  inForms = [];
  outIds = [];
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: MessageAtributtes,
    private bottomSheetRef: MatBottomSheetRef<GenericBottomSheetComponent>,
    private _formBuilder: UntypedFormBuilder
  ) {

    this.durationFormLeave = this._formBuilder.group({
      StartDate: ["",Validators.required],
      EndDate: ["",Validators.required]
    });
   }

  ngOnInit() {
    if (this.data.type == MessageType.CaptchaNumbers) {
      this.setRandomNumberBetween();
    }
    if (this.data.type == MessageType.ExportCancel)
    {
      let date = new Date();       
      this.MinDate = this.calculateMinDate(date);
      this.MaxDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
      this.HastaMinDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
      this.inForms = this.data.actions;     
    }
  }

  action(value: any) {
    if (this.data.type === MessageType.TextAreaYesNo || this.data.type === MessageType.ApproveReject|| this.data.type === MessageType.CancelLeave) {
      const textAreaResponse = {
        response: value,
        text: this.textArea
      };
      this.close.emit(textAreaResponse);
    } else if ((this.data.type === MessageType.MultipleActions) && value) {
      value.execute();
      this.close.emit(true);
    }
    else if(this.data.type === MessageType.ExportCancel)
    {
      if (!value)
      {
        this.close.emit(value);
      }
      else{
        const { StartDate, EndDate } = this.durationFormLeave.value;
        const formBusqueda = {
          startDate: StartDate,
          endDate:  EndDate,
          ids:this.outIds
        }      
        this.close.emit(formBusqueda);
      }
    }
    else if(this.data.type === MessageType.Assign){
      this.close.emit(value);
    }
    else {
      this.close.emit(value);
    }
    this.bottomSheetRef.dismiss();
  }

  setRandomNumberBetween(min = 1000, max = 9999) {
    this.codeGenerated = Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  validate() 
  {
    if (this.codeGenerated === this.code.toString()) 
    {
       this.isMatching = true;
       this.action(true);
    } 
    else 
    {
      this.setRandomNumberBetween();
      this.code = null;
      this.isMatching = false;
      this.setFocus('codeInput');
    }
  }

  ngAfterViewInit() {
    this.setFocus('codeInput');
  }

  private setFocus(element: string) {
    const target: HTMLElement = document.getElementById(element);
    if (target) {
      setTimeout(function waitTargetElem() {
        target.focus();
      }, 100);
    }
  }

  refresh() {
    this.setRandomNumberBetween();
    this.setFocus('codeInput');
    this.code = null;
  }

  exportbuttonEnabled()
  {   const { StartDate, EndDate } = this.durationFormLeave.value;
      return (StartDate === "" || EndDate === "" || this.outIds.length == 0);
  }
  
  calculateMinDate(date: Date): Date {
    try {
      const range = Number(AppConfig.settings.application.noveltiesDayRange);

      if (Number.isNaN(range)) {
        throw new TypeError('Invalid range');
      }

      const result = new Date(date);
      result.setDate(result.getDate() - range);

      return result;

    } catch {
      return new Date(date.getFullYear(), date.getMonth() - 3, date.getDate());
    }
  }
  
  setHastaMaxDate(event: any)
  {
    this.HastaMinDate = event.value;
  }
  setForm(docTtpe: any, event: any)
  {    
    if (event.checked){
      this.outIds.push(docTtpe.id);
    }
    else{
      const index = this.outIds.indexOf(docTtpe.id, 0);
      if (index > -1) {
        this.outIds.splice(index, 1);
      }      
    }    
  }
  disableButton(){
    if (!this.textArea || this.textArea.trim() === '') {
      return true;
    }
    return false;
  }

  promoteConfirmed() {
      if (this.codeGenerated === this.code.toString()) 
      {
        this.isMatching = true;
        this.action(true);
      } 
      else 
      {
        this.setRandomNumberBetween();
        this.code = null;
        this.isMatching = false;
        this.setFocus('codeInput');
      }
  }
}
