import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@demoiselle/security';
import { WebSocketService } from '../../../../core/websocket.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html'
})
export class AppHeader {

  connectedUsers = [];
  totalUsers = 0;

  constructor(
    private el: ElementRef,
    private router: Router,
    private authService: AuthService,
    private webSocketService: WebSocketService) { }

  ngOnInit(): void {
    // wait for the component to render completely
    const nativeElement: HTMLElement = this.el.nativeElement;
    const parentElement: HTMLElement = nativeElement.parentElement;

    // move all children out of the element
    while (nativeElement.firstChild) {
      parentElement.insertBefore(nativeElement.firstChild, nativeElement);
    }

    // remove the empty element(the host)
    parentElement.removeChild(nativeElement);

    // try to listen user's channel
    this.webSocketService.connect()
      .then((subject) => {
        this.webSocketService.send({
          event: "login",
          data: "b83810af-7ba9-4aea-8bb6-f4992a72c5fb"
        });

        subject.subscribe(result => {
          console.log({ result });
          result = JSON.parse(result.data || '{}');
          // {"event":"list","data":"[]"}
          // {"event":"count","data":"1"}
          const event = result.event;
          const data = result.data;
          console.log({ event }, { data });
          switch (event) {
            case 'count':
              this.totalUsers = data;
              break;
            case 'list':
              const users = JSON.parse(data).map(user => {
                const obj = user.split(':');
                let index = 0;
                return {
                  name: obj[index++],
                  email: obj[index++],
                  role: obj[index++],
                  // geo: obj[index++],
                };
              });
              this.connectedUsers = users;
              console.log({ users });
              break;
            default:
              console.warn('Not implemented yet. "event" == ', event);
              break;
          }
        });
        console.log('subject subscribed');
      })
      .catch(err => console.error(err));
  }

  isLoggedIn() {
    return this.authService.isAuthenticated();
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
