import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { <%= name.capital %>Component } from './<%= name.kebab %>.component';
import { <%= name.capital %>FormComponent } from './form/<%= name.kebab %>-form.component';
import { <%= name.capital %>ListComponent } from './list/<%= name.kebab %>-list.component';
import { <%= name.capital %>DetailsComponent } from './details/<%= name.kebab %>-details.component';

/**
 * path: '/<%= name.kebab %>/list' -> list
 * path: '/<%= name.kebab %>/create' -> form (create)
 * path: '/<%= name.kebab %>/edit/{id}' -> form (edit)
 * path: '/<%= name.kebab %>/details/{id}' -> details
 */
const routes: Routes = [
  { path: '<%= name.kebab %>', component: <%= name.capital %>Component },
  { path: '<%= name.kebab %>/list', component: <%= name.capital %>ListComponent },
  { path: '<%= name.kebab %>/create', component: <%= name.capital %>FormComponent },
  { path: '<%= name.kebab %>/edit/:id', component: <%= name.capital %>FormComponent },
  { path: '<%= name.kebab %>/details/:id', component: <%= name.capital %>DetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class <%= name.capital %>RoutingModule { }
