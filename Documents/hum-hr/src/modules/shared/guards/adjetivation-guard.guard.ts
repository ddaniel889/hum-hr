import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { MessageService } from '../errorHandler/message.service';

@Injectable({
  providedIn: 'root'
})
export class AdjetivationGuard implements CanActivate {

  constructor( private readonly router: Router, private readonly msjService: MessageService ) {}

  canActivate(): boolean {
    const hasFiltersMetadata = JSON.parse(localStorage.getItem("hasFiltersMetadata")) as boolean;
    if(hasFiltersMetadata){
      this.msjService.showInfo('No posee permisos para acceder a la info.');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

}
