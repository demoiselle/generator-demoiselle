import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ServiceWorkerService } from './core/sw.service';
import { WebSocketService } from './core/websocket.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';

  constructor(private serviceWorkerService: ServiceWorkerService, private toastr: ToastsManager, private vcr: ViewContainerRef, private wsService: WebSocketService) {
    this.toastr.setRootViewContainerRef(vcr);

    serviceWorkerService.subscribeToPush().then(registration => {
      console.debug({ registration });
    });

    // this.wsService
    //   .connect()
    //   .then((subject) => {
    //     console.log('[WS] connected.');
    //     subject.subscribe(message => {
    //       console.log('Message received', { message });
    //       serviceWorkerService.notify(message.data);
    //     });

    //     // how to send ws message
    //     this.wsService.send({
    //       event: 'login',
    //       data: 'Nome do usuário'
    //     });
    //     // setInterval(()=>{
    //     // }, 1000);
    //   })
    //   .catch(err => console.error(err));
  }
}
