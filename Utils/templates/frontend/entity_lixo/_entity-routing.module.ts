import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuard } from '@demoiselle/security';
import { <%= name.capital %>Component } from './<%= name.kebab %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.kebab %>-edit.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '<%= name.kebab %>',
                data: ['<%= name.capital %>'],
                // canActivate: [AuthGuard],
                component: <%= name.capital %>Component
            },
            {
                path: '<%= name.kebab %>/edit/:id',
                // canActivate: [AuthGuard],
                component: <%= name.capital %>EditComponent
            },
            {
                path: '<%= name.kebab %>/edit',
                canActivate: [AuthGuard],
                component: <%= name.capital %>EditComponent
            }
        ])
    ],
    exports: [RouterModule]
})
export class <%= name.capital %>RoutingModule { }
