import { NgModule } from '@angular/core';
// import { SharedModule } from '../../shared';

import { <%= entity.name.capital %>Service } from './shared/<%= entity.name.kebab %>.service';
import { <%= entity.name.capital %>Component } from './<%= entity.name.kebab %>.component';
import { <%= entity.name.capital %>FormComponent } from './form/<%= entity.name.kebab %>-form.component';
import { <%= entity.name.capital %>ListComponent } from './list/<%= entity.name.kebab %>-list.component';
import { <%= entity.name.capital %>DetailsComponent } from './details/<%= entity.name.kebab %>-details.component';

@Module({
  imports: [
    // SharedModule
  ],
  declarations: [
    <%= entity.name.capital %>Component,
    <%= entity.name.capital %>FormComponent,
    <%= entity.name.capital %>ListComponent,
    <%= entity.name.capital %>DetailsComponent
  ],
  providers: [
    <%= entity.name.capital %>Service
  ],
  exports: [
    // Uncomment those components that you want to use outside in the App.
    // <%= entity.name.capital %>Component,
    // <%= entity.name.capital %>FormComponent,
    // <%= entity.name.capital %>ListComponent,
    // <%= entity.name.capital %>DetailsComponent
  ]
})
export class <%= entity.name.capital %>Module { }
