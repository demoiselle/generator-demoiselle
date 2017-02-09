import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { LoginService } from '../login/shared/login.service';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: '<%= prefix.kebab %>-user-edit',
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent {
  user: User = new User();
  id: number;
  userLoaded: boolean = false;

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private loginService: LoginService,
    private notificationService: NotificationService)
  {
    this.user.firstName = 'Admin';
    this.user.perfil = 'ADMINISTRADOR';
    this.user.email = 'admin@demoiselle.org';
    this.user.pass = '12345678';
  }

  loadUsuario() {
    this.service.get(this.id)
      .subscribe(
      (usuario: User) => {
        this.user = usuario;
        this.userLoaded = true;
      },
      error => {
        this.notificationService.error('Erro ao carregar usuário');
      }
      );
  }

  save(user:User) {
    this.service.create(user).subscribe(
      (result) => {
        this.notificationService.success('Usuário criado com sucesso!');
        this.goBack();
      },
      (error) => {
        this.notificationService.error('Não foi possível salvar o usuário!');
      }
    );
  }
  
  goBack() {
    this.router.navigate(['user']);
  }

}
