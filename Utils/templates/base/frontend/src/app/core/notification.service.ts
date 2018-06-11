import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs';
import { ExceptionService } from '@demoiselle/http';
import { Router } from '@angular/router';

@Injectable()
export class NotificationService {
  errorsSubscription: Subscription;
  constructor(private toastr: ToastrService , private exceptionService: ExceptionService, private router: Router) {
    this.errorsSubscription = this.exceptionService.errors$.subscribe(
      error => this.handleError(error)
    );
  }

  notification(title, message) {
    const options = {
      body: message,
      icon: 'assets/logo.png'
    };
      // Let's check if the browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support system notifications');
      } else if (Notification['permission'] === 'granted') {
        // If it's okay let's create a notification
        navigator.serviceWorker.ready.then(reg => {
          return reg.showNotification(title, options);
        });
      } else if (Notification['permission'] !== 'denied') {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
              return reg.showNotification(title, options);
            });
          }
        });
      }
  }


  success(text: string) {
    this.toastr.success(text);
  }

  error(text: string) {
    this.toastr.error(text);
  }

  info(text: string) {
    this.toastr.info(text);
  }

  warning(text: string) {
    this.toastr.warning(text);
  }

  handleError(httpError: any) {

    if (httpError == null) {
      return;
    }

    if (httpError.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      this.error(`An error occurred: ${httpError.error.message}`);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      switch (httpError.status) {
        case 401:
        case 403:
          this.router.navigate(['/login']);
          break;
        case 412:
          for (const err of httpError.error) {
            const parts = err.error.split('.');
            err.error_method = parts[0] || null;
            err.error_entity = parts[1] || null;
            err.error_field = parts[2] || null;

            this.error('Erro de validação! Campo: ' + err.error_field + ' , Descrição: ' + err.error_description);
          }
          break;
        default:
          for (const error of httpError.error) {
            let description = '';
            if (typeof error.error_description === 'string') {
              description = error.error_description;
            } else if (typeof error.error_description === 'object' && error.error_description.error_code) {
              description = 'Código de erro: ' + error.error_description.error_code;
            }
            this.error('Erro: ' + error.error + ' ' + description);
          }

          break;
      }
    }
  }


}
