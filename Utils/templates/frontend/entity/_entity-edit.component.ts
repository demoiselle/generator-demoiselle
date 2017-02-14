import { Component, OnInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { LoginService } from '../login/shared/login.service';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %> } from './<%= name.lower %>.model';

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>-edit',
  templateUrl: './<%= name.lower %>-edit.component.html'
})
export class <%= name.capital %>EditComponent implements OnInit {
  <%= name.lower %>: <%= name.capital %> = new <%= name.capital %>();
  id: number;
  <%= name.lower %>Loaded: boolean = false;

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: <%= name.capital %>Service,
    private loginService: LoginService,
    private notificationService: NotificationService)
  { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.<%= name.lower %> = <<%= name.capital %>> params;
      }
    });
  }

  load<%= name.capital %>() {
    this.service.get(this.id)
      .subscribe(
      (<%= name.capital %>: <%= name.capital %>) => {
        this.<%= name.lower %> = <%= name.capital %>;
        this.<%= name.lower %>Loaded = true;
      },
      error => {
        this.notificationService.error('Erro ao carregar item!');
      }
      );
  }

  save(<%= name.lower %>:<%= name.capital %>) {
    this.service.create(<%= name.lower %>).subscribe(
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
    this.router.navigate(['<%= name.lower %>']);
  }

}
