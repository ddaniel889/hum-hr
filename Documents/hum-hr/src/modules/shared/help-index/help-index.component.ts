import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HelpStepper } from '../models/helpStepper.model';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-help-index',
  templateUrl: './help-index.component.html',
  styles: []
})
export class HelpIndexComponent implements OnInit {
  @Input() model: HelpStepper;
  @ViewChild("stepper") stepper: MatStepper;
  @Output() helpFinish = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
    console.log(this.model);
    console.log('title', this.model.title);
  }

  move (index: number) {
    this.stepper.selectedIndex = index + 1;
  }

  action(item:any){
    item.execute();
  }

  reset() {
    this.stepper.reset();
  }

  close() {
    this.helpFinish.emit(true);
  }
  
}
