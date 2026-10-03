import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { AuthService } from './auth.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { ICurrentUser } from '../models/ICurrentUser.model';
import { Router } from '@angular/router';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {
    this.handleMicrofrontendEvents();
  }

  isRefreshingToken = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
    | any
  > {
    return next
      .handle(this.addTokenToRequest(request, this.authService.getAccesToken()))
      .pipe(
        catchError(err => {
          if (request.url.endsWith('token')) {
            return throwError(this.mapResponse(err));
          }

          if (err instanceof HttpErrorResponse) {
            switch ((<HttpErrorResponse>err).status) {
              case 401:
                return this.handle401Error(request, next);
            }
          }

          return throwError(this.mapResponse(err));
        })
      );
  }

  private addTokenToRequest(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {
    if (request.url.endsWith('token') || request.url.endsWith('ResetPassword') || request.url.endsWith('GenerateOTP') || request.url.endsWith('QR')) {
      return request;
    }

    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;

      // Reset here so that the following requests wait until the token
      // comes back from the refreshToken call.
      this.tokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((user: ICurrentUser) => {
          if (user) {
            this.tokenSubject.next(user.access_token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return next.handle(
              this.addTokenToRequest(request, user.access_token)
            );
          }

          return <any>this.authService.logout();
        }),
        catchError(err => {
          this.authService.logout(true);
          throw err;
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      this.isRefreshingToken = false;

      return this.tokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenToRequest(request, token));
        })
      );
    }
  }

  private mapResponse(err: any): any {
    const response = {
      code: 'UndefinedError',
      description : ''
    };

    if (err.error && err.error.modelState && err.error.modelState.error && err.error.modelState.error.length > 0) {
      response.code = err.error.modelState.error[0];
      response.description  = err.error.modelState.error[0];
      return response;
    }

    if (err.error && err.error.error) {
      if (err.error.error !== 'error') {
        response.code = err.error.error;
        response.description = err.error.error_description;
        return response;
      } else if (err.error.error_description) {
        response.code = err.error.error_description;
        return response;
      }
    }
    if (err.error && err.error.modelState && Object.keys(err.error.modelState) && Object.keys(err.error.modelState).length > 0) {
        Object.keys(err.error.modelState).forEach(propertyName => {
          response.code = propertyName.toUpperCase();
          if (err.error.modelState[propertyName] && err.error.modelState[propertyName].length > 0) {
            response.description = err.error.modelState[propertyName][0];
          }
        });

        return response;
      }

    if (err.status > 0) {
      response.code = '_' + err.status;
      response.description = err.statusText;
      return response;
    }

    return response;
  }

  private handleMicrofrontendEvents() {
    window.addEventListener("refreshtoken", ({ detail }: any) => {
      const { callbackFn } = detail;
      const sendResponse = (success: boolean) => {
        try {
          callbackFn(success);
        } catch (error) {
          console.error("Error executing callbackFn:", error);
        }
      };

      if (!this.isRefreshingToken) {
        this.isRefreshingToken = true;

        // Reset here so that the following requests wait until the token
        // comes back from the refreshToken call.
        this.tokenSubject.next(null);

        this.authService
          .refreshToken()
          .pipe(finalize(() => (this.isRefreshingToken = false)))
          .subscribe({
            next: (user) => {
              if (user) {
                this.tokenSubject.next(user.access_token);
                localStorage.setItem("currentUser", JSON.stringify(user));
                sendResponse(true);
                return;
              }
              sendResponse(false);
              this.authService.logout();
            },
            error: (err) => {
              sendResponse(false);
              this.authService.logout(true);
              throw err;
            },
          });
      } else {
        this.tokenSubject
          .pipe(
            filter((token) => token != null),
            take(1)
          )
          .subscribe(() => sendResponse(true));
      }
    });
  }
}
