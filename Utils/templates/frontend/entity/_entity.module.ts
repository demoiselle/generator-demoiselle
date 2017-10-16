import { NgModule } from '@angular/core';

import { <%= name.capital %>RoutingModule } from './<%= name.lower %>-routing.module';
import { SharedModule } from '../shared';

import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %>Component } from './<%= name.lower %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.lower %>-edit.component';
import { <%= name.capital %>ViewComponent } from './<%= name.lower %>-view.component';
import { <%= name.capital %>Resolver } from './<%= name.lower %>.resolver';

@NgModule({
    imports: [
        SharedModule,
        <%= name.capital %>RoutingModule
    ],
    declarations: [
        <%= name.capital %>Component,
        <%= name.capital %>EditComponent,
        <%= name.capital %>ViewComponent
    ],
    providers: [
        <%= name.capital %>Service,
        <%= name.capital %>Resolver
    ],
    exports: []
})
export class <%= name.capital %>Module { }
