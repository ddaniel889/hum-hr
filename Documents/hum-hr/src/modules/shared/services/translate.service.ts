import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  constructor() { }

  public translateStateName(state: string): string {    
    switch (state) {
      case "finished":
        return "Terminado";
      case "in progress":
        return "En Progreso";
      case "queued":
        return "Ingresado";
      case "scheduled":
        return "Agendado";
      case "paused":
        return "Pausado";
      case "deleted":
         return "Eliminado";
      case "InDeleted" :
         return "Pendiente de Eliminación"
      default:
        return state;
    }
  }
}
