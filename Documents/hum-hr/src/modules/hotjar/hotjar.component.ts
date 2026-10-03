import { Component, OnInit } from "@angular/core";
import { HotjarService } from "../shared/services/hotjar.service";
import { OrganizationalUnitService } from "../shared/services/organizational-unit.service";

declare function injectHotjar(): any;

@Component({
  selector: "app-hotjar",
  template: "",
  styles: []
})
export class HotjarComponent implements OnInit {
  constructor(
    private hotjarService: HotjarService,
    private ouService: OrganizationalUnitService
  ) { 
  }

  ngOnInit() {
    this.hotjarService.setIsLoaded(false);
    this.hotjarService.injectHotjar(this.ouService.getCurrentOrChildOU());
  }
}