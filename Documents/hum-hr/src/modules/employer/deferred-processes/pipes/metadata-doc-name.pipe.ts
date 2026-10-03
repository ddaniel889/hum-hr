import { Pipe, PipeTransform } from "@angular/core";
import { ProcessOrchestratorMetadataDto } from "../models/deferred-processes.model";

@Pipe({
  name: "metadataDocName",
})
export class MetadataDocNamePipe implements PipeTransform {
  transform(
    value: ProcessOrchestratorMetadataDto[],
    ...args: unknown[]
  ): unknown {
    return value?.find((m) => m.key === "_nomDocumentacion")?.value ?? "";
  }
}
