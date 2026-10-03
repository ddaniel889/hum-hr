import { CustomChipTheme } from "src/app/modules/shared/custom-chip/custom-chip.component";
import { ProcessGroupedState } from "../models/deferred-processes.model";

export const processGroupedStateMap: { [key in ProcessGroupedState]: string } = {
  [ProcessGroupedState.InProgress]: "En progreso",
  [ProcessGroupedState.Processed]: "Finalizado",
  [ProcessGroupedState.PendingActions]: "Acciones pendientes",
  [ProcessGroupedState.DeleteInProgress]: "Borrando",
  [ProcessGroupedState.Deleted]: "Borrado",
  [ProcessGroupedState.ReprocessInProgress]: "Reprocesando",
  [ProcessGroupedState.Reprocessed]: "Reprocesado",
  [ProcessGroupedState.ProcessedWithErrors]: "Con error",
  [ProcessGroupedState.ProcessedWithErrorsAndPendingActions]: "Acciones pendiente y con error",
};

export const processGroupedStateChoices: {
  id: ProcessGroupedState;
  name: string;
}[] = Object.keys(processGroupedStateMap)
  .filter((key) => Number(key) !== ProcessGroupedState.InProgress)
  .map((key) => ({
    id: Number(key),
    name: processGroupedStateMap[key],
  }));

export const processGroupedStateThemeMap: { [key in ProcessGroupedState]: CustomChipTheme } = {
  [ProcessGroupedState.InProgress]: "blue",
  [ProcessGroupedState.Processed]: "green",
  [ProcessGroupedState.PendingActions]: "orange",
  [ProcessGroupedState.DeleteInProgress]: "blue",
  [ProcessGroupedState.ReprocessInProgress]: "blue",
  [ProcessGroupedState.Deleted]: "brown",
  [ProcessGroupedState.Reprocessed]: "brown",
  [ProcessGroupedState.ProcessedWithErrorsAndPendingActions]: "orange",
  [ProcessGroupedState.ProcessedWithErrors]: "red",
};
