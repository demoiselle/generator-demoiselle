import { Component, OnInit } from '@angular/core';

import { <%= name.capital %> } from '../shared/<%= name.kebab %>.model';
import { <%= name.capital %>Service } from '../shared/<%= name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= name.kebab %>-form',
  templateUrl: './<%= name.kebab %>-form.component.html',
  styleUrls: ['./<%= name.kebab %>-form.component.scss'],
  providers: [<%= name.capital %>]
})
export class <%= name.capital %>FormComponent implements OnInit {

  // <%= name.kebab %> Model
  model: <%= name.capital %>;

  constructor(private service: <%= name.capital %>Service) { }

  ngOnInit() {
    console.log('<%= name.capital %>FormComponent initialized.');
  }

  onSubmit() {
    // TODO: handle submit
    // 1) submitting = true
    // 2) service.submit().finally( submitting = false; )

  }

  _create() {
    // <%= name.capital %>Service.create(this.model);
  }

  _update() {
    // <%= name.capital %>Service.update(this.model);
  }
}
