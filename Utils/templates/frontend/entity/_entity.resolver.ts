import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';

@Injectable()
export class <%= name.capital %>Resolver implements Resolve<any> {

  constructor(private service: <%= name.capital %>Service) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.service.get(route.params['id']);
  }
}