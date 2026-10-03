import { Pipe, PipeTransform } from "@angular/core";
import { processOrchestatorTypeMap } from "../data/process-type.data";

@Pipe({
  name: "processTypeName",
})
/**
 * Pipe to translate process type id to name
 *
 * @usage
 *   {{ processTypeId | processTypeName }}
 *
 * @param {number} id process type id
 * @returns {string} process type name
 */
export class ProcessTypeNamePipe implements PipeTransform {
  private processOrchestatorTypeMap = processOrchestatorTypeMap;

  /**
   * Transform process type id to name
   *
   * @param {number} id process type id
   * @returns {string} process type name
   */
  transform(id: number, ...args: unknown[]): string {
    return this.processOrchestatorTypeMap[id] || "Desconocido";
  }
}
