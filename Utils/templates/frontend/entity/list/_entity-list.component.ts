import { Component, OnInit } from '@angular/core';

import { <%= entity.name.capital %> } from '../shared/<%= entity.name.kebab %>.model';
import { <%= entity.name.capital %>Service } from '../shared/<%= entity.name.kebab %>.service';

@Component({
  moduleId: module.id,
  selector: '<%= entity.name.kebab %>-list',
  templateUrl: './<%= entity.name.kebab %>-list.component.html',
  styleUrls: ['./<%= entity.name.kebab %>-list.component.scss'],
  providers: [<%= entity.name.capital %>]
})
export class <%= entity.name.capital %>ListComponent implements OnInit {

  list: <%= entity.name.capital %>[] = [];

  constructor(private service: <%= entity.name.capital %>Service) { }

  ngOnInit() {
    this.service.list().then(list => this.list = list);
    console.log('<%= entity.name.capital %>ListComponent initialized.');
  }
}
