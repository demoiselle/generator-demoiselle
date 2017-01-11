/*
 * Testing a Service
 * More info: https://angular.io/docs/ts/latest/guide/testing.html
 */

import { TestBed, async, inject } from '@angular/core/testing';
import { <%= entity.name.capital %>Service } from './<%= entity.name.kebab %>.service';

describe('<%= entity.name.capital %>Service', () => {
    let service;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [<%= entity.name.capital %>Service],
            providers: [
                <%= entity.name.capital %>Service
                // for additional providers, write as examples below
                // ServiceName,
                // { provider: ServiceName, useValue: fakeServiceName },
                // { provider: ServiceName, useClass: FakeServiceClass },
                // { provider: ServiceName, useFactory: fakeServiceFactory, deps: [] },
            ]
        });
    });

    // you can also wrap inject() with async() for asynchronous tasks
    // it('...', async(inject([...], (...) => {}));

    it('should enter the assertion',
        inject([<%= entity.name.capital %>Service], (s: <%= entity.name.capital %>Service) => {
            expect(true).toBe(false);
        })
    );
});
