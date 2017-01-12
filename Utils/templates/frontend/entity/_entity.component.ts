import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'dml-<%= name.kebab %>',
  templateUrl: '<%= name.kebab %>.component.html'
})
export class <%= name.capital %>Component implements OnInit {
  constructor() { }

  ngOnInit() { }
}
