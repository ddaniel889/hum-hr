import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../shared/errorHandler/message.service';
import { AppConfig } from "src/app/app.config";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styles: []
})
export class WelcomeComponent implements OnInit {
  legend: string;
  urlHelp: string;
  constructor(private route: ActivatedRoute, private msjService: MessageService) {
    this.urlHelp = AppConfig.settings.custom.employeeHelpUrl;
  }

  ngOnInit() {
    this.legend = this.route.snapshot.data['legend'];

    if (this.legend) {
      this.msjService.showInfo(this.legend);
    }
  }

}
