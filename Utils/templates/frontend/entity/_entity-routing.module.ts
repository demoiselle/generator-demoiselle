import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@demoiselle/security';
import { <%= name.capital %>Component } from './<%= name.lower %>.component';
import { <%= name.capital %>EditComponent } from './<%= name.lower %>-edit.component';
import { <%= name.capital %>Resolver } from './<%= name.lower %>.resolver';

const routes: Routes = [{
        path: '',
        canActivate: [AuthGuard],
        component: <%= name.capital %>Component
    }, {
        path: 'edit/:id',
        canActivate: [AuthGuard],
        component: <%= name.capital %>EditComponent,
        resolve: {
            <%= name.lower %>: <%= name.capital %>Resolver
        }
    }, {
        path: 'edit',
        component: <%= name.capital %>EditComponent
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class <%= name.capital %>RoutingModule { }
