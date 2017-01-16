import { Component, OnInit } from '@angular/core';

import { <%= name.capital %> } from '../shared/<%= name.kebab %>.model';
import { <%= name.capital %>Service } from '../shared/<%= name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= name.kebab %>-list',
  templateUrl: './<%= name.kebab %>-list.component.html',
  styleUrls: ['./<%= name.kebab %>-list.component.scss'],
  providers: [<%= name.capital %>]
})
export class <%= name.capital %>ListComponent implements OnInit {

  list: <%= name.capital %>[] = [];

  constructor(private service: <%= name.capital %>Service) { }

  ngOnInit() {
    this.service.list().then(list => this.list = list);
    console.log('<%= name.capital %>ListComponent initialized.');
  }
}
