import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= name.capital %> } from './<%= name.lower %>.model';

@Injectable()
export class <%= name.capital %>Service {

  constructor(private http: Http) {
  }

  list(currentPage: number, itemsPerPage: number) {
    let start = (currentPage*itemsPerPage) - (itemsPerPage);
    let end = (currentPage*itemsPerPage) - 1;
    return this.http.get('~main/<%= name.lower %>?range='+start+'-'+end)
      .map(res => res);
  }

  get(id: number) {
    return this.http.get('~main/<%= name.lower %>/' + id)
      .map(res => <<%= name.capital %>>res.json());
  }

  create(<%= name.lower %>: <%= name.capital %>) {
    return this.http.post('~main/<%= name.lower %>', <%= name.lower %>);
  }

  update(<%= name.lower %>: <%= name.capital %>) {
    return this.http.put('~main/<%= name.lower %>/' + <%= name.lower %>.id, <%= name.lower %>);
  }

  delete(<%= name.lower %>: <%= name.capital %>) {
    return this.http.delete('~main/<%= name.lower %>/' + <%= name.lower %>.id);
  }
}
