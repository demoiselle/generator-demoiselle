import { Component, OnInit } from '@angular/core';

import { <%= entity.name.capital %> } from '../shared/<%= entity.name.kebab %>.model';
import { <%= entity.name.capital %>Service } from '../shared/<%= entity.name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= entity.name.kebab %>-details',
  templateUrl: './<%= entity.name.kebab %>-details.component.html',
  styleUrls: ['./<%= entity.name.kebab %>-details.component.scss'],
  providers: [ <%= entity.name.capital %> ]
})
export class <%= entity.name.capital %>DetailsComponent implements OnInit {

  // <%= entity.name.capital %> Model
  model: <%= entity.name.capital %>;

  constructor(private service: <%= entity.name.capital %>Service) { }

  ngOnInit() {
    console.log('<%= entity.name.capital %>DetailsComponent initialized.');
  }
}
