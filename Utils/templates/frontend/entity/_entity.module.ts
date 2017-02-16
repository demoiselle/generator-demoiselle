import { NgModule } from '@angular/core';

import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { <%= name.capital %>RoutingModule } from './<%= name.lower %>-routing.module';
import { SharedModule } from '../shared';

import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %>Component } from './<%= name.lower %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.lower %>-edit.component';

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
