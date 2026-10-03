import { Injectable } from "@angular/core";
import { ValidatorFn, UntypedFormControl } from "@angular/forms";

@Injectable({
  providedIn: 'root'
})
export class FormValidationservice {
  whitespace: ValidatorFn = (control: UntypedFormControl) => {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  };
  
  constructor() { }

}
