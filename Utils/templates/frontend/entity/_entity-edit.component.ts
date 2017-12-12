import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../core/notification.service';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %> } from './<%= name.lower %>.model';<%
  if (hasCustomEntity) { %>
import { UtilService } from '../core/util.service';<% } %>

const ACTIONS = {
  CRIAR: 'Criar',
  EDITAR: 'Editar'
};

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>-edit',
  templateUrl: './<%= name.lower %>-edit.component.html'
})
export class <%= name.capital %>EditComponent implements OnInit {
  <%= name.lower %>: <%= name.capital %>;<%

  if (hasCustomEntity) {
      properties.filter(i => !i.isPrimitive).forEach(function (property) { %>
  <%= property.name %>Options;<%
      });
  } %>

  action = ACTIONS.CRIAR;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: <%= name.capital %>Service,<%
    if (hasCustomEntity) { %>
    private utilSerivce: UtilService,<% } %>
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    if (this.route.snapshot.data['<%= name.lower %>']) {
      this.<%= name.lower %> = this.route.snapshot.data['<%= name.lower %>'];
      this.action = ACTIONS.EDITAR;
    } else {
      this.action = ACTIONS.CRIAR;
      this.<%= name.lower %> = new <%= name.capital %>();
    }<% if (hasCustomEntity) { %>

    this.populateCombo();<%
    } %>
  }<% if (hasCustomEntity) { %>

  populateCombo() {
    const entitiesNames = [<%
      properties.filter(i => !i.isPrimitive).forEach(function (property, index, arr) {
        %>{
      entityName: '<%= property.name %>',
      endpoint: '<%= property.type.toLowerCase() %>s'
    }<%= (index === arr.length - 1 ) ? '' : ', ' %><%});
    %>];
    const entitiesEndpoint = entitiesNames.map(e => e.endpoint);

    this.utilSerivce.loadAllEntityListAsPromise(entitiesEndpoint).then(results => {
        entitiesNames.forEach((val, index, arr) => {
            this[val.entityName + 'Options'] = results[index];
            this.updateCombo(val.entityName, results[index]);
        });
    });
  }

  updateCombo(entityName, data) {
      if (this.<%= name.lower %> && this.<%= name.lower %>[entityName]) {
          this.<%= name.lower %>[entityName] = data.find(i => i.id === this.<%= name.lower %>[entityName].id);
      }
  }<% } %>

  startLoading() {
    this.isLoading = true;
  }

  endLoading() {
    this.isLoading = false;
  }

  save(<%= name.lower %>: <%= name.capital %>) {
    this.startLoading();
    if (!<%= name.lower %>.id) {
      delete <%= name.lower %>.id;
      this.service.create(<%= name.lower %>).subscribe(
        (result) => {
          this.notificationService.success('Item criado com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível salvar!');
        },
        () => {
          this.endLoading();
        }
      );
    } else {
      this.service.update(<%= name.lower %>).subscribe(
        (result) => {
          this.notificationService.success('Item alterado com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível alterar!');
        },
        () => {
          this.endLoading();
        }
      );
    }
  }

  remove() {
    this.startLoading();
    if (this.<%= name.lower %>.id) {
      this.service.delete(this.<%= name.lower %>.id).subscribe(
        (result) => {
          this.notificationService.success('Item removido com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível deletar o Item!');
        },
        () => {
          this.endLoading();
        }
      );
    } else {
      console.warn('Item sem ID!?');
      this.endLoading();
    }
  }

  goBack() {
    this.router.navigate(['<%= name.lower %>']);
  }

}
