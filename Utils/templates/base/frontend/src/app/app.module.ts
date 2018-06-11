import { NgModule, ApplicationRef } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
  imports: [
    AppRoutingModule,
    CoreModule.forRoot(),
    ServiceWorkerModule.register('/sw-app.js', { enabled: environment.production })

  ],
  declarations: [
    AppComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
