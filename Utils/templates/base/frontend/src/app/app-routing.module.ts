import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@demoiselle/security';

// Import Containers
import {
  FullLayout,
  SimpleLayout
} from './shared/layout/containers';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '',
    component: FullLayout,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
        data: {
          title: 'Dashboard',
          showInSidebar: true,
          icon: 'icon-speedometer'
        },
      },
      {
        path: 'user',
        loadChildren: './user/user.module#UserModule',
        data: {
          title: 'Usuários',
          showInSidebar: true,
          icon: 'icon-user'
        },
      }
      
    ]
  },
  {
    path: '',
    component: SimpleLayout,
    data: {
      title: 'Pages'
    },
    children: [
      {
        path: 'login',
        loadChildren: './login/login.module#LoginModule',
      }
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
