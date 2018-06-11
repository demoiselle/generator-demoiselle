import { Component, ViewContainerRef } from '@angular/core';
// import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { WebSocketService } from './core/websocket.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';

  constructor(private webSocketService: WebSocketService) {

    console.debug('[WS] connectando...');
    this.webSocketService.connect()
      .then((wsConnection) => {
        console.info('[WS] conectado.');
      });

  }
}
