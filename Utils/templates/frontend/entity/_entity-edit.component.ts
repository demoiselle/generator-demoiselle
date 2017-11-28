import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %> } from './<%= name.lower %>.model';

const ACTIONS = {
  CRIAR: 'Criar',
  EDITAR: 'Editar'
};

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>-edit',
  templateUrl: './<%= name.lower %>-edit.component.html'
})
export class <%= name.capital %>EditComponent implements OnInit {
  <%= name.lower %>: <%= name.capital %>;

  action = ACTIONS.CRIAR;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: <%= name.capital %>Service,
    private notificationService: NotificationService)
  { }

  ngOnInit() {
    if (this.route.snapshot.data['<%= name.lower %>']) {
      this.<%= name.lower %> = this.route.snapshot.data['<%= name.lower %>'];
      this.action = ACTIONS.EDITAR;
    } else {
      this.action = ACTIONS.CRIAR;
      this.<%= name.lower %> = new <%= name.capital %>();
    }
  }

  startLoading() {
    this.isLoading = true;
  }

  endLoading() {
    this.isLoading = false;
  }

  save(<%= name.lower %>:<%= name.capital %>) {
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
