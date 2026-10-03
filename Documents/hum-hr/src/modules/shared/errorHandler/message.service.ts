import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MsjDescriptionPipe } from '../pipes/msj-description.pipe';
import { DialogComponent } from './dialog.component';
import { Observable } from 'rxjs';
import { DialogOptions } from '../models/dialogOptions.model';
const ACTION = 'Entendido';
@Injectable({
  providedIn: 'root'
})

export class MessageService {
  private config: MatSnackBarConfig;
  constructor(
    private snackBar: MatSnackBar,
    private msjpipe: MsjDescriptionPipe,
    private bottomSheet: MatBottomSheet) {
    this.config = new MatSnackBarConfig();
  }
  showError(error: any, config = Object.assign(this.config)): void {
    this.snackBar.open(this.msjpipe.transform(error), ACTION, config);
  }

  showInfo(msj: string, extendDuration: boolean = false, showConfirm: boolean  = false) {
    this.snackBar.open(msj, showConfirm ? ACTION : '', extendDuration ? {
      duration: 15000 } : {});
  }

  showOkCancel(msj: string, okAction?: string, cancelAction?: string): Observable<any> {
    const sheetRef =  this.bottomSheet.open(DialogComponent, {
      data: {
        message: msj,
        okAction:  okAction || 'Aceptar',
        cancelAction: cancelAction || 'Cancelar',
        option: DialogOptions.OkCancel
      }
    });

    return sheetRef.afterDismissed();
  }

  showYesNoCancel(msj: string, yesAction?: string, noAction?: string,  cancelAction?: string): Observable<any> {
    const sheetRef =  this.bottomSheet.open(DialogComponent, {
      data: {
        message: msj,
        okAction:  yesAction || 'Si',
        noAction:  noAction || 'No',
        cancelAction: cancelAction || 'Cancelar',
        option: DialogOptions.YesNoCancel
      }
    });

    return sheetRef.afterDismissed();
  }
  close() {
    this.snackBar.dismiss();
  }
}
