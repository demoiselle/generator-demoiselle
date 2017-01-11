import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'dml-<%= entity.name.kebab %>',
  templateUrl: '<%= entity.name.kebab %>.component.html'
})
export class <%= entity.name.capital %>Component implements OnInit {
  constructor() { }

  ngOnInit() { }
}
