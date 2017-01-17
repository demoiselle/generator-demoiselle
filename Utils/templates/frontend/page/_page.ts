import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'page-<%= name.kebab %>',
    templateUrl: '<%= name.kebab %>.html'
})
export class <%= name.capital %>Page implements OnInit {

    constructor() {
    }

    ngOnInit() {
        console.log('[<%= name.capital %>Page] initialized.');
    }
}
