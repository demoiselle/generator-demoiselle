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
export class UserEditComponent implements OnInit {
  user: User = new User();
  id: number;
  params: any;
  userLoaded: boolean = false;

  public selectedRole;
  public roles = [
    {value: 'USUARIO', description: 'Usuário'},
    {value: 'GERENTE', description: 'Gerente'},
    {value: 'ADMINISTRADOR', description: 'Administrador'}
  ];

  private routeSubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: UserService,
    private loginService: LoginService,
    private notificationService: NotificationService)
  {
    this.user.id = null;
    this.user.firstName = 'Admin';
    this.user.perfil = 'ADMINISTRADOR';
    this.user.email = 'admin@demoiselle.org';
    this.user.pass = '12345678';
    this.selectedRole = this.user.perfil;
  }

  ngOnInit() {
    this.loadPerfil();
    this.route.params.subscribe(params => {
      console.log(params);
      if (Object.keys(params).length > 0) {
        this.user = <User> params;
        this.selectedRole = this.user.perfil;
      }
    });
  }

  loadPerfil() {
    this.service.getPerfil().subscribe(
      (result) => {
        this.roles = result;
        if (this.roles.length > 0) {
          this.selectedRole = this.roles[0];
        }
      },
      (error) => {
        console.log('error');
        console.log(error);
        this.notificationService.error('Não foi possível carregar a lista de perfis!');
      }
    );
  }

  loadUsuario() {
    this.service.get(this.id)
      .subscribe(
      (user: User) => {
        this.user = user;
        this.userLoaded = true;
      },
      error => {
        this.notificationService.error('Erro ao carregar usuário');
      }
      );
  }

  save(user:User) {
    if (user.id) {
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
    else {
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

  changeRole(event) {
    this.selectedRole = event.target.value;
  }
}
