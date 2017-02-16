import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { LoginService } from '../login/login.service';
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
        this.<%= name.lower %>.id = (<<%= name.capital %>> params).id;
        this.<%= name.lower %>.description = (<<%= name.capital %>> params).description;
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
    if (!<%= name.lower %>.id) {
      delete <%= name.lower %>.id;
      this.service.create(<%= name.lower %>).subscribe(
        (result) => {
          this.notificationService.success('Item criado com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível salvar!');
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
        }
      );
    }
  }
  
  goBack() {
    this.router.navigate(['<%= name.lower %>']);
  }

}
