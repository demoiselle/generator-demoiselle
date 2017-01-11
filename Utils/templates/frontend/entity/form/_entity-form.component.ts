import { Component, OnInit } from '@angular/core';

import { <%= entity.name.capital %> } from '../shared/<%= entity.name.kebab %>.model';
import { <%= entity.name.capital %>Service } from '../shared/<%= entity.name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= entity.name.kebab %>-form',
  templateUrl: './<%= entity.name.kebab %>-form.component.html',
  styleUrls: ['./<%= entity.name.kebab %>-form.component.scss'],
  providers: [ <%= entity.name.capital %> ]
})
export class <%= entity.name.capital %>FormComponent implements OnInit {

  // <%= entity.name.kebab %> Model
  model: <%= entity.name.capital %>;

  constructor(private service: <%= entity.name.capital %>Service) { }

  ngOnInit() {
    console.log('<%= entity.name.capital %>FormComponent initialized.');
  }

  onSubmit() {
    // TODO: handle submit
    // 1) submitting = true
    // 2) service.submit().finally( submitting = false; )

  }

  _create() {
    // <%= entity.name.capital %>Service.create(this.model);
  }

  _update() {
    // <%= entity.name.capital %>Service.update(this.model);
  }
}
