import { Component, OnInit } from '@angular/core';

import { <%= name.capital %> } from '../shared/<%= name.kebab %>.model';
import { <%= name.capital %>Service } from '../shared/<%= name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= name.kebab %>-details',
  templateUrl: './<%= name.kebab %>-details.component.html',
  styleUrls: ['./<%= name.kebab %>-details.component.scss'],
  providers: [ <%= name.capital %> ]
})
export class <%= name.capital %>DetailsComponent implements OnInit {

  // <%= name.capital %> Model
  model: <%= name.capital %>;

  constructor(private service: <%= name.capital %>Service) { }

  ngOnInit() {
    console.log('<%= name.capital %>DetailsComponent initialized.');
  }
}

