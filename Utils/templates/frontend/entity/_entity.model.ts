export class <%= name.capital %> {
  <% properties.forEach(function (property){ %>
    <%= property.name %>: String;<% });%>

  constructor(<% properties.forEach(function (property, index, arr){ %>
    <%= property.name %>?: String<%= (index === arr.length - 1 ) ? '' : ',' %><% });%>
  ) { }
}
