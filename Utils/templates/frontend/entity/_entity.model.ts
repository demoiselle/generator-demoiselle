export class <%= name.capital %> {<%
  properties.forEach(function (property) { %>
    <%= property.name %>: <%= property.isPrimitive ? 'string' : 'any' %>;<%
  });%>

    constructor(<% properties.forEach(function (property, index, arr){ %>
      <%= property.name %>?: <%= property.isPrimitive ? 'string' : 'any' %><%= (index === arr.length - 1 ) ? '' : ',' %><% });%>
    ) { }
}
