import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { HelpStepper } from '../models/helpStepper.model';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-help-stepper',
  templateUrl: './help-stepper.component.html',
  styles: []
})
export class HelpStepperComponent implements OnInit {
  @Input() model: HelpStepper[];
  @ViewChild("stepper") stepper: MatStepper;
  @Output() helpFinish = new EventEmitter<boolean>();
  zoomedImg:false;

  constructor() { }

  ngOnInit() {
  }

  next() {
    this.stepper.next();
  }

  back() {
    this.stepper.previous();
  }

  start() {
    this.stepper.reset();
  }

  close() {
    this.helpFinish.emit(true);
  }
}
