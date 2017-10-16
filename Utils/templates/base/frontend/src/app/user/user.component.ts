import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
//import { PaginacaoComponent } from '../shared/paginacao/paginacao.component';
import { NotificationService } from '../shared';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']

})
export class UserComponent implements OnInit {
  user: User;
  users: User[];

  //@ViewChild('pagination') public pagination: PaginacaoComponent;

  @ViewChild('staticModalDelete') public staticModalDelete: ModalDirective;

  // Pagination
  public itemsPerPage: number = 10;
  public totalItems: number = 0;

  // Filter
  public ascValue = '⇧';
  public descValue = '⇩';
  public formOrder = {
    firstName: '',
    perfil: '',
    email: ''
  };

  public filterActive = true;
  public filters = {
    firstName: '',
    perfil: '',
    email: ''
  };

  public searchString = '';

  constructor(private service: UserService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.list();
  }

  findByLike(field: string = null, desc: boolean = false) {
    let filter = this.processFilter();

    this.service.findByLike(/*this.pagination.currentPage*/ 1, this.itemsPerPage, filter, field, desc).subscribe(
      (result) => {
        try {
          this.users = result.json();
        } catch (e) {
          console.log('Can not convert result to JSON.');
          console.log(e);
          this.users = [];
        }
        let contentRange = result.headers.get('Content-Range');
        if (contentRange) {
          this.totalItems = Number(contentRange.substr(contentRange.indexOf('/')+1, contentRange.length));
        }
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de itens!');
        this.users = error;
      }
    );
  }

  list(field: string = null, desc: boolean = false) {
    let filter = this.processFilter();
    this.service.list(/*this.pagination.currentPage*/ 1, this.itemsPerPage, filter, field, desc).subscribe(
      (result) => {
        try {
          this.users = result.json();
        } catch (e) {
          console.log('Can not convert result to JSON.');
          console.log(e);
          this.users = [];
        }
        let contentRange = result.headers.get('Content-Range');
        if (contentRange) {
          this.totalItems = Number(contentRange.substr(contentRange.indexOf('/')+1, contentRange.length));
        }
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de itens!');
        this.users = error;
      }
    );
  }

  delete(user: User) {
    this.service.delete(user).subscribe(
      (result) => {
        this.user = null;
        this.staticModalDelete.hide();
        this.notificationService.success("Usuário removido com sucesso!");
        this.list();
      },
      (error) => {
        this.notificationService.error('Não foi possível remover!');
      }
    );
  }

  showModalDelete(user: User) {
    this.user = user;
    this.staticModalDelete.show();
  }

  hideStaticModals() {
    this.staticModalDelete.hide();
  }

  // Pagination
  onPageChange(currentPage) {
    this.list();
  }

  onPageItemsChange(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
  }

  // Filter
  processFilter() {
    let filter = '';
    if (this.filters.firstName !== '') {
      filter += '&firstName=' + this.filters.firstName;
    }
    if (this.filters.perfil !== '') {
      filter += '&perfil=' + this.filters.perfil;
    }
    if (this.filters.email !== '') {
      filter += '&email=' + this.filters.email;
    }
    return filter;
  }

  simpleSearch() {
    this.filters.firstName = this.searchString;
    this.clearFormOrder();
    this.list();
    this.clearSearchFilters();
  }

  clearSimpleSearch() {
    this.searchString = '';
  }

  filterSearch() {
    this.clearSimpleSearch();
    this.clearFormOrder();
    this.findByLike();
  }

  clearSearchFilters() {
    for (let key in this.filters) {
      this.filters[key] = '';
    }
  }

  orderBy(field, order) {
    this.toggleFormOrder(field);
    this.list(field, this.formOrder[field] === this.descValue ? true : false);
  }

  toggleFormOrder(field) {
    if (this.formOrder[field] === '') {
      this.formOrder[field] = this.ascValue;
    } else if (this.formOrder[field] === this.ascValue) {
      this.formOrder[field] = this.descValue;
    } else if (this.formOrder[field] === this.descValue) {
      this.formOrder[field] = this.ascValue;
    }
    for (let key in this.formOrder) {
      if (key !== field) {
        this.formOrder[key] = '';
      }
    }
  }

  clearFormOrder() {
    for (let key in this.formOrder) {
      this.formOrder[key] = '';
    }
  }

  toggleFilters() {
    if (this.filterActive) {
      this.filterActive = false;
      this.clearSearchFilters();
    } else {
      this.filterActive = true;
    }
  }

}
