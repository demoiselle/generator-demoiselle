export class <%= name.capital %> {
  <% properties.forEach(function (property){ %>
    <%= property.name %>: string;<% });%>

  constructor(<% properties.forEach(function (property, index, arr){ %>
    <%= property.name %>?: string<%= (index === arr.length - 1 ) ? '' : ',' %><% });%>
  ) { }
}
