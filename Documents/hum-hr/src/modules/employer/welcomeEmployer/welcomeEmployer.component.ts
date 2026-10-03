import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../shared/errorHandler/message.service';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-welcome-employer',
  templateUrl: './welcomeEmployer.component.html',
  styles: []
})
export class WelcomeEmployerComponent implements OnInit {
  legend: string;
  helpUrl = AppConfig.settings.custom.employerHelpUrl;
  constructor(private route: ActivatedRoute, private msjService: MessageService) {
  }

  ngOnInit() {
    this.legend = this.route.snapshot.data['legend'];

    if (this.legend) {
      this.msjService.showInfo(this.legend);
    }
  }

}
