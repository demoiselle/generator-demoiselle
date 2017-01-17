/**
 * <%= name.capital %> Model
 */
export class <%= name.capital %> {
  <% properties.forEach(function(property) { %><%= property.name.camel %>: <%= property.type %>;
  <% }) %>
  constructor(
    <% properties.forEach(function(property, index, props) { %><%= property.name.camel %>?: <%= property.type %><% if (index < properties.length-1) { %>,<% } %>
    <% }) %>
  ) { }
}
