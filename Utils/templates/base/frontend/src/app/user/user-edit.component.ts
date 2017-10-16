import { Component, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NotificationService } from '../shared';
import { LoginService } from '../login/login.service';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent implements OnInit {
  user: User;

  funcao = 'Criar';

  public perfis = [
    {value: 'GERENTE', description: 'Gerente'},
    {value: 'USUARIO', description: 'Usuário'},
    {value: 'ADMINISTRADOR', description: 'Administrador'}
  ];

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private loginService: LoginService,
    private notificationService: NotificationService) {
  }

  ngOnInit() {
    if (this.route.snapshot.data['user']) {
      this.user = this.route.snapshot.data['user'];
      this.funcao = 'Editar';
    } else {
      this.funcao = 'Criar';
      this.user = new User();
    }
    this.loadPerfil(null);
  }

  loadPerfil(perfil) {
    this.service.getPerfil().subscribe(
      (result) => {
        this.perfis = [];
        Object.keys(result).forEach(element => {
          this.perfis.push({value: element, description: result[element]});
        });
        if (this.funcao == 'Criar') {
          this.user.perfil = this.perfis[0].value;
        }
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de perfis!');
      }
    );
  }

  save(user: User) {
    if (!user.id) {
      delete user.id;
      this.service.create(user).subscribe(
        (result) => {
          this.notificationService.success('Usuário criado com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível salvar o usuário!');
        }
      );
    } else {
      this.service.update(user).subscribe(
        (result) => {
          this.notificationService.success('Usuário alterado com sucesso!');
          this.goBack();
        },
        (error) => {
          this.notificationService.error('Não foi possível alterar o usuário!');
        }
      );
    }
  }

  goBack() {
    this.router.navigate(['user']);
  }

  changePerfil(event) {
    this.user.perfil = event.target.value;
  }

}
