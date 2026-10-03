import { Component, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-employer-controls",
  templateUrl: "./controls.component.html",
  styles: []
})
export class ControlsComponent implements OnInit {
  constructor() { }

  @ViewChild("sidenav") sidenav: any;
  opened: any = false;

  editMode = false;
  isOpen = false;
  userFirstname: string;
  userlastname: string;


  isExpanded = true;
  element: HTMLElement;

  toggleActive(event: any) {
    event.preventDefault();
    if (this.element !== undefined) {
      // this.element.style.backgroundColor = "white";
    }

    const target = event.currentTarget;
    // target.style.backgroundColor = "#e51282";
    this.element = target;
  }

  ngOnInit() {
    this.userFirstname = localStorage.getItem('userFirstname');
    this.userlastname = localStorage.getItem('userLastname');
    window.scroll(0, 0);
  }

  editingMode() {
    this.editMode = !this.editMode;
  }

  setIsOpen(value) {
    this.isOpen = value.isOpen;
  }
}
