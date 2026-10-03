import { Component, OnInit } from '@angular/core';
import { MessageService } from '../shared/errorHandler/message.service';

@Component({
  selector: 'app-login-browser',
  templateUrl: './login-browser.component.html',
  styles: []
})
export class LoginBrowserComponent implements OnInit {
  browserName: string;
  majorVersion: number;
  isBrwoserOld = false;
  toggle = false;
  constructor( ) { }

  ngOnInit() {
    this.navigatorCheck();
  }
  navigatorCheck() {
    const ua = navigator.userAgent;
    let tem: any;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      this.browserName = 'IE';
      this.majorVersion = (tem[1] || '');
      return;

    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        this.browserName = tem[1];
        this.majorVersion = tem[2];
        return;
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
    this.browserName = M[0];
    // tslint:disable-next-line:radix
    this.majorVersion = parseInt(M[1]);
    if ((this.browserName === 'Chrome' && this.majorVersion < 60)
      || (this.browserName === 'OPR' && this.majorVersion < 37)
      || (this.browserName === 'Firefox' && this.majorVersion < 55)
      || (this.browserName === 'Edge' && this.majorVersion < 15)
      || (this.browserName === 'Safari' && this.majorVersion < 11)
      || (this.browserName === 'IE')) {
        this.isBrwoserOld = true;
    }
  }
  toggleOption() {
    this.toggle = !this.toggle;
  }
  ok() {
    this.isBrwoserOld = false;
  }
}


