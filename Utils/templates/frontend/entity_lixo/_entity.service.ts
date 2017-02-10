import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= name.capital %> } from './<%= name.kebab %>.model';

@Injectable()
export class <%= name.capital %>Service {

  constructor(private http: Http) {
  }

  list(currentPage: number, itemsPerPage: number) {
    let start = (currentPage*itemsPerPage) - (itemsPerPage);
    let end = (currentPage*itemsPerPage) - 1;
    return this.http.get('~main/<%= name.kebab %>?range='+start+'-'+end)
      .map(res => res);
  }

  get(id: number) {
    return this.http.get('~main/<%= name.kebab %>/' + id)
      .map(res => <<%= name.capital %>>res.json());
  }

  create(<%= name.kebab %>: <%= name.capital %>) {
    return this.http.post('~main/<%= name.kebab %>', <%= name.kebab %>);
  }

  update(<%= name.kebab %>: <%= name.capital %>) {
    return this.http.put('~main/<%= name.kebab %>/' + <%= name.kebab %>.id, <%= name.kebab %>);
  }

  delete(<%= name.kebab %>: <%= name.capital %>) {
    return this.http.delete('~main/<%= name.kebab %>/' + <%= name.kebab %>.id);
  }
}
