import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { LoginService } from '../login/shared/login.service';
import { <%= name.capital %>Service } from './<%= name.kebab %>.service';
import { <%= name.capital %> } from './<%= name.kebab %>.model';

@Component({
  selector: '<%= prefix.kebab %>-<%= name.kebab %>-edit',
  templateUrl: './<%= name.kebab %>-edit.component.html'
})
export class <%= name.capital %>EditComponent {
  <%= name.kebab %>: <%= name.capital %> = new <%= name.capital %>();
  id: number;
  <%= name.kebab %>Loaded: boolean = false;

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: <%= name.capital %>Service,
    private loginService: LoginService,
    private notificationService: NotificationService)
  { }

  load<%= name.capital %>() {
    this.service.get(this.id)
      .subscribe(
      (<%= name.capital %>: <%= name.capital %>) => {
        this.<%= name.kebab %> = <%= name.capital %>;
        this.<%= name.kebab %>Loaded = true;
      },
      error => {
        this.notificationService.error('Erro ao carregar item!');
      }
      );
  }

  save(<%= name.kebab %>:<%= name.capital %>) {
    this.service.create(<%= name.kebab %>).subscribe(
      (result) => {
        this.notificationService.success('Item criado com sucesso!');
        this.goBack();
      },
      (error) => {
        this.notificationService.error('Não foi possível salvar!');
      }
    );
  }
  
  goBack() {
    this.router.navigate(['<%= name.kebab %>']);
  }

}
