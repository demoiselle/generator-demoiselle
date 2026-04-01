import { useApi } from '@/composables/useApi';

const BASE_URL = '/<%= name.kebab %>';

export function use<%= name.capital %>Service() {
  const api = useApi();
<% methods.forEach(function (method) { %>
  /**
   * <%= method.value.summary %>
   *
   * <%= method.value.description %>
<%_ if (method.value.parameters) {
      method.value.parameters.forEach(function (param) { _%>
   * @param {*} <%= param.name %> - <%= param.description %>
<%_   });
    } _%>
   */
  async function <%= method.name.camel %>(<%
    if (method.value.parameters){ %><%= Array.prototype.reduce.call(method.value.parameters, function (acc, cur) { return acc + ', ' + cur.name; }, '').replace(/^, /,'') %><%
    } %>) {
    const url = BASE_URL;
    const response = await api.<%= method.name.camel %>(url);
    return response.data;
  }
<% }); %>
  return {
<% methods.forEach(function (method, index) { %>    <%= method.name.camel %><%= index < methods.length - 1 ? ',' : '' %>
<% }); %>  };
}
