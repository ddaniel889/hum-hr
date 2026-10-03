import { Injectable } from "@angular/core";
import { OrganizationalUnit } from "../models";

declare function injectHotjar(): any;

@Injectable({
  providedIn: 'root'
})
export class HotjarService {
  
  isLoaded: boolean = false;

  constructor() { 
  }

  injectHotjar(ou: OrganizationalUnit) {
    if(!this.isLoaded && ou && ou.useMonitorUsage){
      injectHotjar();
      this.isLoaded = true;
    }
  }

  setIsLoaded(isLoaded: boolean) {
    this.isLoaded = isLoaded;
  }
}
