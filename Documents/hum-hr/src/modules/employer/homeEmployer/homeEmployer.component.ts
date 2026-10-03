import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EmployerProcessService } from "../../shared/services/employer-process.service";

@Component({
  selector: "app-home-employer",
  templateUrl: "./homeEmployer.component.html",
  styles: []
})
export class HomeEmployerComponent implements OnInit {
  returnUrl: string;
  processClass: string;
  isLoading = false;
  closeFloatMode = false

  constructor(
    private employerProcessService: EmployerProcessService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    window.scroll(0, 0);
    this.returnUrl = this.activatedRoute.snapshot.queryParams["returnUrl"];
  }

  refresh(): void {
    this.isLoading = true;
    this.employerProcessService.freshRefresh(15)
    .toPromise()
    .then(() => this.isLoading = false
    );


      
  }

  changeDetailClass(detailClass: string) {
    this.processClass = detailClass;
    this.closeFloatMode = false;
  }
}
