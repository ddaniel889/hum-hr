import { Component, OnInit } from "@angular/core";
import { EmployeeProcessService } from "../../shared/services/employee-process.service";
import { AuthService } from "../../shared/auth/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styles: []
})
export class HomeComponent implements OnInit {
  constructor(
    private employeeProcessService: EmployeeProcessService,
    private authService: AuthService
  ) { }
  editMode = false;
  isOpen = false;
  userFirstname: string;
  userlastname: string;
  hasLD: boolean;
  hasRSD: boolean;

  opened: any = false;

  ngOnInit() {
    this.userFirstname = localStorage.getItem('userFirstname');
    this.userlastname = localStorage.getItem('userLastname');

    this.hasLD = this.authService.isInRole('EMPLOYEE LD') || this.authService.isInRole('CANDIDATE') ;
    this.hasRSD = this.authService.isInRole('EMPLOYEE_2016');

    window.scroll(0, 0);
  }

  editingMode() {
    this.editMode = !this.editMode;
  }

  setIsOpen(value) {
    this.isOpen = value.isOpen;
  }
  refresh(): void {
    this.employeeProcessService.refreshMyProcess().toPromise();
  }
}
