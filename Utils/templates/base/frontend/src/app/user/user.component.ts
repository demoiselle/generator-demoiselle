import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { NotificationService } from '../shared';
import { UserService } from './shared/user.service';
import { User } from './shared/user.model';

@Component({
  selector: '<%= prefix.kebab %>-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']

})
export class UserComponent implements OnInit {
  user: User;
  users: User[];

  @ViewChild('staticModal') public staticModal: ModalDirective;

  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public currentPage: number = 1;

  constructor(private service: UserService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.list();
    console.log('[UserComponent] initialized.');
  }

  showModalDetails(user: User) {
    this.user = user;
    this.staticModal.show();
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.list();
  }

  list() {
    this.service.list(this.currentPage, this.itemsPerPage).subscribe(
      (result) => {
        this.totalItems = 20;
        this.users = result.json();
        let contentRange = result.headers.get('Content-Range');
        this.totalItems = contentRange.substr(contentRange.indexOf('/')+1, contentRange.length);
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de usuarios!');
        this.totalItems = 20;
        this.users = error;
      }
    );
  }

  edit(user:User) {
    this.service.update(user).subscribe(
      (result) => {
        this.notificationService.success('Usuário atualizado com sucesso!');
      },
      (error) => {
        this.notificationService.error('Não foi possível salvar o usuário!');
      }
    );
  }

  delete(usuario: User) {
    this.service.delete(usuario).subscribe(
      (result) => {
        this.user = null;
        this.staticModal.hide();
        this.list();
      },
      (error) => {
        this.notificationService.error('Não foi possível remover o usuário!');
      }
    );
  }
}
