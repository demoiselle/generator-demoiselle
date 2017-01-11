/**
 * <%= entity.name.capital %> Model
 */
export class <%= entity.name.capital %> {
  <% entity.properties.forEach(function(property) { %><%= property.name.camel %>: <%= property.type %>;
  <% }) %>
  constructor(
    <% entity.properties.forEach(function(property, index, props) { %><%= property.name.camel %>?: <%= property.type %><% if (index < entity.properties.length-1) { %>,<% } %>
    <% }) %>
  ) { }
}
