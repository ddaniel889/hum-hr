import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../shared/auth/auth.service";
import { OrganizationalUnitConfig } from '../shared/models/organizational-unit-config.model';

@Component({
  selector: "app-access-denied",
  templateUrl: "./access-denied.component.html",
  styles: []
})
export class AccessDeniedComponent implements OnInit {
  isLoading = false;
  organizationalUnits: OrganizationalUnitConfig[] = [];
  selectedOu: number;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    document.body.hidden = false;
    this.isLoading = true;
    this.auth.getUserOus().toPromise()
        .then(ous => {
          if (ous.length === 1) {
            this.selectedOu = ous[0].organizationalUnitId;
            this.changeOu();
          }

          this.organizationalUnits = ous;
          this.isLoading = false;
        });
  }

  backToLogin() {
    this.router.navigate(["login"]);
  }

  changeOu() {
    this.isLoading = true;
    this.auth.setUserOu(String(this.selectedOu)).then(() => this.router.navigate(['employee']));
  }
}
