import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { <%= entity.name.capital %>Component } from './<%= entity.name.kebab %>.component';
import { <%= entity.name.capital %>FormComponent } from './form/<%= entity.name.kebab %>-form.component';
import { <%= entity.name.capital %>ListComponent } from './list/<%= entity.name.kebab %>-list.component';
import { <%= entity.name.capital %>DetailsComponent } from './details/<%= entity.name.kebab %>-details.component';

/**
 * path: '/<%= entity.name.kebab %>/list' -> list
 * path: '/<%= entity.name.kebab %>/create' -> form (create)
 * path: '/<%= entity.name.kebab %>/edit/{id}' -> form (edit)
 * path: '/<%= entity.name.kebab %>/details/{id}' -> details
 */
const routes: Routes = [
  { path: '<%= entity.name.kebab %>', component: <%= entity.name.capital %>Component },
  { path: '<%= entity.name.kebab %>/list', component: <%= entity.name.capital %>ListComponent },
  { path: '<%= entity.name.kebab %>/create', component: <%= entity.name.capital %>FormComponent },
  { path: '<%= entity.name.kebab %>/edit/:id', component: <%= entity.name.capital %>FormComponent },
  { path: '<%= entity.name.kebab %>/details/:id', component: <%= entity.name.capital %>DetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class <%= entity.name.capital %>RoutingModule { }
