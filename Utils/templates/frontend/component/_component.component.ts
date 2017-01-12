import { Component, OnInit } from '@angular/core';

@Component({
  selector: '<%= name.kebab %>',
  templateUrl: './<%= name.kebab %>.component.html',
  styleUrls: ['./<%= name.kebab %>.component.scss']
})
export class <%= name.capital %>Component implements OnInit {

  ngOnInit() {
    console.log('<%= name.capital %>Component initialized.');
  }
}
