import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { <%= entity.name.capital %> } from './<%= entity.name.kebab %>.model';

/**
 * <%= entity.name.capital %> Data Service
 *
 * Requests:
 * - GET     ~/api/<%= entity.name.kebab %>
 * - GET     ~/api/<%= entity.name.kebab %>/:id
 * - POST    ~/api/<%= entity.name.kebab %>
 * - PUT     ~/api/<%= entity.name.kebab %>/:id
 * - DELETE  ~/api/<%= entity.name.kebab %>/:id
 */
@Injectable()
export class <%= entity.name.capital %>Service {

  private endpoint: string = 'api/<%= entity.name.kebab %>';

  constructor(private http: Http) {
  }

  list() {
    // TODO: paginação, ordenação, etc.
    return this.http.get(this.endpoint)
      .map((response: Response) => <<%= entity.name.capital %>[]>response.json().data);
  }

  get(id: number) {
    let resource = this.endpoint + '/' + id;
    return this.http.get(resource)
      .map((response: Response) => <<%= entity.name.capital %>>response.json().data);
  }

  create(<%= entity.name.camel %>: <%= entity.name.capital %>) {
    return this.http.post(this.endpoint, <%= entity.name.capital %>);
  }

  update(<%= entity.name.camel %>: <%= entity.name.capital %>) {
    return this.http.put(this.endpoint, <%= entity.name.camel %>);
  }

  delete(<%= entity.name.camel %>: <%= entity.name.capital %>) {
    return this.http.delete(this.endpoint + '/' + <%= entity.name.camel %>.id);
  }
}
