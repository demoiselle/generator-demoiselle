import { NgModule } from '@angular/core';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { <%= name.capital %>RoutingModule } from './<%= name.kebab %>-routing.module';
import { SharedModule } from '../shared';

import { <%= name.capital %>Service } from './<%= name.kebab %>.service';
import { <%= name.capital %>Component } from './<%= name.kebab %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.kebab %>-edit.component';

@NgModule({
    imports: [
        SharedModule,
        <%= name.capital %>RoutingModule,
        ConfirmationPopoverModule.forRoot({
            confirmText: 'Sim',
            cancelText: 'Não',
            appendToBody: true
        })
    ],
    declarations: [
        <%= name.capital %>Component, <%= name.capital %>EditComponent
    ],
    providers: [<%= name.capital %>Service],
    exports: []
})
export class <%= name.capital %>Module { }
