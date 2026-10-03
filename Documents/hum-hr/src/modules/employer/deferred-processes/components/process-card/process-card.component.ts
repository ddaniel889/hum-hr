import { Component, Input } from "@angular/core";
import { OngoingProcessOrchestrationDto } from "../../models/deferred-processes.model";

@Component({
  selector: "app-process-card",
  templateUrl: "./process-card.component.html",
  styleUrls: ["./process-card.component.scss"],
})
export class ProcessCardComponent {
  @Input() process: OngoingProcessOrchestrationDto;
}
