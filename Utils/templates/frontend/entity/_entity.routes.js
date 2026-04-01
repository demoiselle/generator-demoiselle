import <%= name.capital %>List from './<%= name.lower %>/<%= name.capital %>List.vue';
import <%= name.capital %>Form from './<%= name.lower %>/<%= name.capital %>Form.vue';

export default [
  {
    path: '<%= name.lower %>',
    name: '<%= name.lower %>-list',
    component: <%= name.capital %>List,
    meta: {
      title: '<%= name.capital %>',
      showInSidebar: true,
      icon: 'icon-diamond'
    }
  },
  {
    path: '<%= name.lower %>/create',
    name: '<%= name.lower %>-create',
    component: <%= name.capital %>Form,
    meta: { title: '<%= name.capital %>' }
  },
  {
    path: '<%= name.lower %>/edit/:id',
    name: '<%= name.lower %>-edit',
    component: <%= name.capital %>Form,
    meta: { title: '<%= name.capital %>' }
  }
];
