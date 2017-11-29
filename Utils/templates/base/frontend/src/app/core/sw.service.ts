import { Injectable } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';
import { NgPushRegistration } from '@angular/service-worker/companion/comm';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ServiceWorkerService {
  private registration: NgPushRegistration;

  constructor(private sw: NgServiceWorker, private http: HttpClient ) {
    if ('serviceWorker' in navigator) {
      Notification.requestPermission(permission => {
        // If the user accepts, let's create a notification
        // this.permission = permission;
        console.debug({ permission });

        if (permission === 'denied') {
          console.warn('Permission for notifications was denied')
        }
        return permission;
      });
      sw.push.subscribe(pushObj => {
        console.debug('got push message', pushObj);
        // this.showNotification(pushObj.notification.title);
      });
    } else {
      console.warn('Browser do not support Service Worker.');
    }
  }

  getFingerprint(): Promise<string> {
    return this.subscribeToPush().then((registration) => {
      const url = registration.url;
      if (!url) {
        console.debug('Wrong registration structure?', registration);
        throw new Error('Wrong registration structure?');
      }

      let fingerprint = url.split('/').pop();
      return fingerprint;
    });
  }

  sendFingerprint(fingerprint): Observable<Object> {
    const url = environment.apiUrl + 'auth/fingerprint';
    const data = { fingerprint };
    return this.http.post(url, data);
  }

  subscribeToPush(): Promise<NgPushRegistration> {
    return new Promise((resolve, reject) => {
      if (this.registration) {
        return resolve(this.registration);
      }

      const subs = this.sw.registerForPush({
        // applicationServerKey: environment.applicationServerKey,
      })
        .subscribe((r: NgPushRegistration) => {
          console.debug('successfully registered', r);

          this.registration = r;
          resolve(this.registration)
        },
        err => {
          console.error('error registering for push', err);
          reject(err);
        }, () => {
          console.debug('completed');
          subs.unsubscribe();
        });
    });
  }

  unsubscribeFromPush() {
    this.registration.unsubscribe().subscribe(success => {
      console.debug('unsubscribed', success);
    })
  }

  forceUpdate(): void {
    this.sw.updates.subscribe(u => {
      console.debug('update event', u);

      // Immediately activate pending update
      if (u.type == 'pending') {
        this.sw.activateUpdate(u.version).subscribe(e => {
          console.debug('updated', e);
          alert("App updated! Reload App!");
          // location.reload();
        });
      }
    });

    this.sw.checkForUpdate();
  }

  pingCompanion(): void {
    this
      .sw
      .ping()
      .subscribe(undefined, undefined, () => {
        console.debug('pong');
      });

  }

  registerForPush(): void {
    this
      .sw
      .push
      .map(value => JSON.stringify(value))
      .subscribe(value => {
        console.debug(value)
      });
  }
}
