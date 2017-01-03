/*
 * Testing a Component with Router and Spy
 * More info: https://angular.io/docs/ts/latest/guide/testing.html#!#routed-component-w-param
 */
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, async, inject } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { <%= name.capital %>Component } from './entity.component';

describe('<%= name.capital %>Component', () => {
    let fixture, comp;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                <%= name.capital %>Component
            ],
            imports: [
                RouterTestingModule,
                RouterModule
            ],
            schemas: [ NO_ERRORS_SCHEMA ]
        });
    });

    beforeEach(async(() => {
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(<%= name.capital %>Component);
            comp = fixture.componentInstance;
            fixture.detectChanges();
        });
    }));

    it('should enter the assertion', inject([Router], (router: Router) => {
        const spy = spyOn(router, 'navigate');

        comp.enterAMethodToCall(methodArguments);

        expect(spy.calls.mostRecent().args[0]).toEqual([ '/' ]);
        // expect(spy.calls.mostRecent().args[1].queryParams.paramName).toEqual('value');
    }));
});
