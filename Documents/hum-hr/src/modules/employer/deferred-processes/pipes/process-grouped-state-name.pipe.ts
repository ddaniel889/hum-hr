import { Pipe, PipeTransform } from "@angular/core";
import { processGroupedStateMap } from "../data/process-grouped-state.data";

@Pipe({
  name: "processGroupedStateName",
})
export class ProcessGroupedStateNamePipe implements PipeTransform {
  /**
   * Transform process state id to name
   *
   * @param {number} id process state id
   * @param {string} unrecognoizedName
   * @returns {string} process state name
   */
  transform(
    id: number,
    unrecognoizedName: string = "Desconocido",
    ...args: unknown[]
  ): string {
    return processGroupedStateMap[id] || unrecognoizedName;
  }
}
