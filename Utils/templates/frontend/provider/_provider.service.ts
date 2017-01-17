import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class <%= name.capital %>Service {

  constructor(private http: Http) { }
  <% methods.forEach(function (method) { %>
    /**
     * <%= method.value.summary %>
     *
     * <%= method.value.description %>
     * <%
        if (method.value.parameters) {
          method.value.parameters.forEach(function (param) {
      %>
     * @param <%= param.name %> - <%= param.description %><%
          })
      }%>
     */
    <%= method.name.camel %>(<%
    if (method.value.parameters){ %><%= Array.prototype.reduce.call(method.value.parameters, function (acc, cur) { return acc + ',' + cur.name; }, '').replace(/^,/,'') %><%
    } %>){
      let url = '/<%= name.kebab %>';
      return this.http.<%= method.name.camel %>(url)
        .map((response: Response) => response.json().data);
    }
    <% }) %>
}
