import { Pipe, PipeTransform } from "@angular/core";
import { processGroupedStateThemeMap } from "../data/process-grouped-state.data";
import { CustomChipTheme } from "src/app/modules/shared/custom-chip/custom-chip.component";

@Pipe({
  name: "processGroupedStateChipTheme",
})
export class ProcessGroupedStateChipTheme implements PipeTransform {
  /**
   * Transform process state id to CustomChipTheme
   *
   * @param {number} id process state id
   * @param {CustomChipTheme} unrecognoizedTheme
   * @returns {CustomChipTheme} custom chip theme
   */
  transform(
    id: number,
    unrecognoizedTheme: CustomChipTheme = "brown",
    ...args: unknown[]
  ): string {
    return processGroupedStateThemeMap[id] || unrecognoizedTheme;
  }
}
