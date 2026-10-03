import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from './app.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Humanage';
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
     if (event instanceof NavigationEnd) {
       (<any>window).ga('create', AppConfig.settings.googleAnalyticsKey, 'auto');
       (<any>window).ga('set', 'page', event.urlAfterRedirects);
       (<any>window).ga('send', 'pageview');
       (<any>window).pdfWorkerSrc = '../assets/js/pdf.worker.js';
     }
   });
 }
}

