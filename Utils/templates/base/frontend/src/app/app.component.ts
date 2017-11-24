import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ServiceWorkerService } from './core/sw.service';

@Component({
  // tslint:disable-next-line
  selector: 'body',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';

  constructor(private sw: ServiceWorkerService, private toastr: ToastsManager, private vcr: ViewContainerRef) {
    this.toastr.setRootViewContainerRef(vcr);

    sw.subscribeToPush().then(registration => {
      console.debug({ registration });
    });
  }
}
