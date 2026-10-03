import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { MsgType, QueryDocument } from '../models/query-document.model';

@Injectable({
  providedIn: 'root'
})
export class FileDocumentQueryService {
  cppUrl = AppConfig.settings.apiUrls.cpp;


  constructor(
    private readonly http: HttpClient,
  ) {}

  /**
   * Obtener motivos de consulta...
   */
  getMotives() {
    return [
      { id: MsgType.DescuentoIncorrecto, description: 'Descuento Incorrecto' },
      { id: MsgType.HorasExtrasNoLiquidadas, description: 'Horas Extras No Liquidadas' },
      { id: MsgType.ErrorEnHaberes, description: 'Error en Haberes' },
      { id: MsgType.Otros, description: 'Otros' }
    ];
  }

  /**
   * Obtener historial de mensajes/consultas de un documento
   */
  getQueryData(docId: number, queryTypeID: number): Observable<QueryDocument[]> {
    return this.http.get<QueryDocument[]>(`${this.cppUrl}/DocMessages/ByDocument/${docId}/${queryTypeID}`);
  }

  // Crear una nueva consulta inicial
  postQuery(payload: QueryDocument): Observable<any> {
    return this.http.post<QueryDocument>(`${this.cppUrl}/DocMessages`, payload)
  }

  /**
   * Enviar una respuesta (En este caso, parece que reutilizas el POST de DocMessageDTO)
   */
  postReply(reply: QueryDocument): Observable<QueryDocument> {
    return this.postQuery(reply);
  }

  /**
   * Borrar un mensaje específico
   */
  deleteMessage(msgId: string): Observable<void> {
    return this.http.delete<void>(`${this.cppUrl}/DocMessages/${msgId}`);
  }

  /**
   * Cerrar una consulta específica
   * @param docID
   */
  closeQuery(docID: string | number): Observable<any> {
    return this.http.put<any>(`${this.cppUrl}/DocMessages/${docID}/close`, {});
  }
}
