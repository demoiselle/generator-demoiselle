import { Injectable } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { AuthService } from '@demoiselle/security';
import { Router } from '@angular/router';

@Injectable()
export class ServiceWorkerService {
    private permission;

    // tslint:disable-next-line:max-line-length
    readonly VAPID_PUBLIC_KEY = new Uint8Array([/* your public key here*/]);

    constructor(
      private swPush: SwPush,
      private swUpdate: SwUpdate,
      private http: HttpClient,
      // private subscriptionService: SubscriptionService,
      private notificationService: NotificationService,
      private router: Router,
      private authService: AuthService
    ) {
      this.subscribeToUpdates();
    }

    startWebPush() {
      this.askPermission();
    }

    askPermission() {
      if ('Notification' in window && this.swPush.isEnabled) {
        const promiseChain = new Promise((resolve, reject) => {
          const permissionPromise = Notification.requestPermission((result) => {
            resolve(result);
          });
          if (permissionPromise) {
            permissionPromise.then(resolve);
          }
        })
        .then((result) => {
          if (result === 'granted') {
            this.subscribeToPush();
          } else {
            console.warn('Permission for notifications was denied');
          }
        });
      }


      // if ('Notification' in window && this.swPush.isEnabled) {
      //       Notification.requestPermission(permission => {
      //           // If the user accepts, let's create a notification
      //           // console.debug({ permission });
      //           this.permission = permission;

      //           if (permission === 'denied') {
      //               console.warn('Permission for notifications was denied');
      //           }
      //           return permission;
      //       });
      //   } else {
      //     console.warn('Browser do not support Service Worker or it is not enabled');
      //   }
    }


    subscribeToPush() {
      console.log('going to subscribe to push service....');

      navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
        serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.VAPID_PUBLIC_KEY
        })
        .then(pushSubscription => {
          console.log('successfully registered', pushSubscription);

          // this.askPermission();
          // this.subscribeToPushMessages();

          // send subscription to backend
          // this.subscriptionService.saveSubscription(pushSubscription).subscribe(
          //   res => {
          //     console.log('subscription successfully saved in backend');
          //   }
          // );
        });
      });

    }

    doLogout() {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }

    unsubscribeFromPushAndDoLogout() {

        // if SW not enabled or supported
        if (!this.swPush.isEnabled) {
          // tslint:disable-next-line:no-console
          console.debug('SW not enabled or supported');
          this.doLogout();
          return;
        }
        // if we do not have one registration
        // NOTE: using getRegistration() because ready not firing when using ng serve
        navigator.serviceWorker.getRegistration().then((reg) =>  {
          console.log('[App] testing getRegistration: ', reg);
          if (!reg) {
            this.doLogout();
            return;
          }
        });

        navigator.serviceWorker.ready.then(reg => {
          if (!reg) { // if we do not have one registration
            this.doLogout();
            return;
          }
          reg.pushManager.getSubscription().then(pushSubscription => {
            console.log('[App] pushSubscription', pushSubscription);

            // Se não tivermos uma subscrição, fazemos logout
            if (!pushSubscription) {
                this.doLogout();
                return;
            }

            // Delete the subscription from the backend
            // this.subscriptionService.removeSubscription(pushSubscription).subscribe(
            //   res => {
            //     console.log('[App] Subscription removed from backend!', res);

            //     // Unsubscribe current client (browser)
            //     pushSubscription.unsubscribe().then(success => {
            //         console.log('[App] Unsubscription successful', success);
            //     }).catch(err => {
            //         console.log('[App] Unsubscription failed', err);
            //     });

            //     this.doLogout();
            //   },
            //   err => {
            //     console.log('[App] Error removing subscription from backend', err);
            //     this.doLogout();
            //   }
            // );

          }).catch(err => {
            console.log('Error during getSubscription()', err);
            this.doLogout();
          });
        });

    }

    subscribeToUpdates() {
      if (this.swUpdate.isEnabled) {
          this.swUpdate.available.subscribe(() => {
              // if (confirm('Nova versão disponível. Carregar?')) {
                this.swUpdate.activateUpdate().then(() => {
                  console.log('[App] SwUpdate: Loading new app version');
                  window.location.reload();
                });
              // }
          });
      }
    }

    /**
     * Subscreve para ouvir mensagens web 'push'
     * Utilize apenas se deseja tratar/exibir as mensagens na aplicação. Ex: Barra de notificações.
     * Obs: Recebe mensagens de web push apenas com a aplicação aberta
     *      Para exibir notificações mesmo com a app fechada, ver service worker sw-push.js
     */
    subscribeToPushMessages() {
      if (this.swPush.isEnabled) {
          this.swPush.messages.subscribe(message => {
            console.log({message});
            this.notificationService.notification(
              'Demanda alterada!',
              'Demanda ' + message['workItemId'] + ' - Situação alterada de ' + message['beforeState'] + ' para ' + message['afterState']
            );

            // TODO: call notify with message details
            // this.notify(notification['title'], options);
          }, error => {
            console.log('Erro ao receber notificação!', error);
          });
      } else {
          console.warn('Browser do not support Service Worker or it is not enabled');
      }
  }

    notify(title, options = {}) {
        if (!('Notification' in window)) {
            throw new Error('This browser does not support system notifications');
        }

        if (this.permission === 'granted') {
            // If it's okay let's create a notification
            return new Notification(title, options);
        }
    }
}
