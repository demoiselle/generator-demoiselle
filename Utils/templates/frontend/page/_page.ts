import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'page-<%= prefix.kebab %>',
    templateUrl: '<%= prefix.kebab %>.html'
})
export class <%= prefix.capital %>Page implements OnInit {

    constructor() {
    }

    ngOnInit() {
        console.log('[<%= prefix.capital %>Page] initialized.');
    }
}
