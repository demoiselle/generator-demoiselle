import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@demoiselle/security';
import { NotificationService } from '../../core/notification.service';
import { ServiceWorkerService } from '../../core/sw.service';
import { CredentialManagementService } from '../credentials.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  user: any = {
    username: 'admin@demoiselle.org',
    password: '123456'
  };
  supportAutoLogin = false;
  showQuickAuth = true;

  protected fingerprint;

  constructor(protected authService: AuthService,
    protected router: Router,
    protected notificationService: NotificationService,
    protected serviceWorkerService: ServiceWorkerService,
    protected credentialManagementService: CredentialManagementService
  ) { }

  ngOnInit() {
    console.debug('[LoginComponent] initialized.');

    this.serviceWorkerService.getFingerprint()
      .then(figerprint => {
        this.fingerprint = figerprint;
      });

    this.credentialManagementService.isCredentialsAvailable()
      .then(result => {
        if (result === true) {
          this.supportAutoLogin = true;
          this.showQuickAuth = true;
        }
      })
      .catch(err => {
        this.supportAutoLogin = false;
        this.showQuickAuth = false;
      });
  }

  login() {
    const payload = {
      username: this.user.username,
      password: this.user.password
    };

    this.loginWithPayload(payload);
  }

  autoLogin() {
    this.credentialManagementService.autoSignin()
      .then(credentials => {
        const payload = {
          username: credentials.id,
          password: credentials.password
        };
        this.loginWithPayload(payload);
      })
      .catch(err => {
        console.warn(err);
        this.showQuickAuth = false;
      });
  }

  loginWithPayload(payload) {
    const subs = this.authService.login(payload).subscribe(res => {
      this.credentialManagementService.store(payload)
        .then((result) => {
          console.debug('credentials stored.');
          if (this.fingerprint) {
            this.serviceWorkerService.sendFingerprint(this.fingerprint)
              .subscribe(result => {
                console.debug({ result });
              }, error => {
                console.error({ error });
              });
          }
        })
        .catch((err) => {
          console.error('error when trying to store credentials.', err);
        });
      this.notificationService.success('Login realizado com sucesso!');
    }, error => {
      if (error.status === 401 || error.status === 406) {
        let errors = error.error;
        for (let err of errors) {
          this.notificationService.error(err.error);
        }
        this.user.password = '';
      };
    }, () => {
      subs.unsubscribe();
    });
  }
}
