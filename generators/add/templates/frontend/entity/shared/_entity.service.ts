import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= name.capital %> } from './<%= name.kebab %>.model';

/**
 * <%= name.capital %> Data Service
 */
@Injectable()
export class <%= name.capital %>Service {

  private endpoint: string = 'api/<%= name.kebab %>';

  constructor(private http: Http) {
  }

  list() {
    // TODO: paginação, ordenação, etc.
    return this.http.get(this.endpoint)
      .map((response: Response) => <<%= name.capital %>[]>response.json().data);
  }

  get(id: number) {
    let resource = this.endpoint + '/' + id;
    return this.http.get(resource)
      .map((response: Response) => <<%= name.capital %>>response.json().data);
  }

  create(<%= name.camel %>: <%= name.capital %>) {
    return this.http.post(this.endpoint, <%= name.capital %>);
  }

  update(<%= name.camel %>: <%= name.capital %>) {
    return this.http.put(this.endpoint, <%= name.camel %>);
  }

  delete(<%= name.camel %>: <%= name.capital %>) {
    return this.http.delete(this.endpoint + '/' + <%= name.camel %>.id);
  }
}
