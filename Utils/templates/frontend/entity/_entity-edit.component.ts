import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %> } from './<%= name.lower %>.model';

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>-edit',
  templateUrl: './<%= name.lower %>-edit.component.html'
})
export class <%= name.capital %>EditComponent implements OnInit {
  <%= name.lower %>: <%= name.capital %>;
  private funcao = 'Criar';

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: <%= name.capital %>Service,
    private notificationService: NotificationService)
  { }

  ngOnInit() {
    if (this.route.snapshot.data['<%= name.lower %>']) {
      this.<%= name.lower %> = this.route.snapshot.data['<%= name.lower %>'];
      this.funcao = 'Editar';
    } else {
      this.funcao = 'Criar';
      this.<%= name.lower %> = new <%= name.capital %>();
    }
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