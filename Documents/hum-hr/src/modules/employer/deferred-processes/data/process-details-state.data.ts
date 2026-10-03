import { ProcessDetailsState, ProcessGroupedState } from "../models/deferred-processes.model";

export const processDetailsStateMap: { [key in ProcessDetailsState]: string } = {
  [ProcessDetailsState.NoPendingActions]: "Sin Acciones pendientes",
  [ProcessDetailsState.HasPendingActions]: "Con Acciones pendientes",
  [ProcessDetailsState.NoError]: "Sin error",
  [ProcessDetailsState.HasError]: "Con error",
  [ProcessDetailsState.NoDeleted]: "No Borrado",
  [ProcessDetailsState.Deleted]: "Borrado",
};

export const processDetailsStateChoices: {
  id: ProcessGroupedState;
  name: string;
}[] = Object.keys(processDetailsStateMap)
  .filter((key) => Number(key) !== ProcessGroupedState.InProgress)
  .map((key) => ({
    id: Number(key),
    name: processDetailsStateMap[key],
  }));

