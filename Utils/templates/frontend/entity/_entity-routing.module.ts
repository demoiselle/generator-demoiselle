import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '@demoiselle/security';
import { <%= name.capital %>Component } from './<%= name.lower %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.lower %>-edit.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '<%= name.lower %>',
                data: ['<%= name.capital %>'],
                // canActivate: [AuthGuard],
                component: <%= name.capital %>Component
            },
            {
                path: '<%= name.lower %>/edit/:id',
                // canActivate: [AuthGuard],
                component: <%= name.capital %>EditComponent
            },
            {
                path: '<%= name.lower %>/edit',
                // canActivate: [AuthGuard],
                component: <%= name.capital %>EditComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class <%= name.capital %>RoutingModule { }
