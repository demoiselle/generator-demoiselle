import { NgModule } from '@angular/core';
// import { SharedModule } from '../../shared';

import { <%= name.capital %>Service } from './shared/<%= name.kebab %>.service';
import { <%= name.capital %>Component } from './<%= name.kebab %>.component';
import { <%= name.capital %>FormComponent } from './form/<%= name.kebab %>-form.component';
import { <%= name.capital %>ListComponent } from './list/<%= name.kebab %>-list.component';
import { <%= name.capital %>DetailsComponent } from './details/<%= name.kebab %>-details.component';

@Module({
  imports: [
    // SharedModule
  ],
  declarations: [
    <%= name.capital %>Component,
    <%= name.capital %>FormComponent,
    <%= name.capital %>ListComponent,
    <%= name.capital %>DetailsComponent
  ],
  providers: [
    <%= name.capital %>Service
  ],
  exports: [
    // Uncomment those components that you want to use outside in the App.
    // <%= name.capital %>Component,
    // <%= name.capital %>FormComponent,
    // <%= name.capital %>ListComponent,
    // <%= name.capital %>DetailsComponent
  ]
})
export class <%= name.capital %>Module { }
