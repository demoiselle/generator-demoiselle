import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { NotificationService } from '../shared';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';
import { <%= name.capital %> } from './<%= name.lower %>.model';

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>',
  templateUrl: './<%= name.lower %>.component.html',
  styleUrls: ['./<%= name.lower %>.component.scss']

})
export class <%= name.capital %>Component implements OnInit {
  <%= name.lower %>: <%= name.capital %>;
  <%= name.lower %>s: <%= name.capital %>[];

  @ViewChild('staticModalDelete') public staticModalDelete: ModalDirective;

  // Pagination
  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public currentPage: number = 1;

  // Filter
  public ascValue = '⇧';
  public descValue = '⇩';
  public formOrder = {
    id: '',
    description: ''
  };

  public filterActive = true;
  public filters = {
    id: '',
    description: ''
  };

  constructor(private service: <%= name.capital %>Service, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.list();
  }

  

  list(field: string = null, desc: boolean = false) {
    let filter = this.processFilter();
    this.service.list(this.currentPage, this.itemsPerPage, filter, field, desc).subscribe(
      (result) => {
        try {
          this.<%= name.lower %>s = result.json();
        } catch (e) {
          console.log('Can not convert result to JSON.');
          console.log(e);
          this.<%= name.lower %>s = [];
        }
        let contentRange = result.headers.get('Content-Range');
        if (contentRange) {
          this.totalItems = Number(contentRange.substr(contentRange.indexOf('/')+1, contentRange.length));
        }
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de itens!');
        this.<%= name.lower %>s = error;
      }
    );
  }

  delete(<%= name.lower %>: <%= name.capital %>) {
    this.service.delete(<%= name.lower %>).subscribe(
      (result) => {
        this.<%= name.lower %> = null;
        this.staticModalDelete.hide();
        this.notificationService.success("<%= name.capital %> removido com sucesso!");
        this.list();
      },
      (error) => {
        this.notificationService.error('Não foi possível remover!');
      }
    );
  }

  showModalDelete(<%= name.lower %>: <%= name.capital %>) {
    this.<%= name.lower %> = <%= name.lower %>;
    this.staticModalDelete.show();
  }

  hideStaticModals() {
    this.staticModalDelete.hide();
  }

  // Pagination
  pageChanged(event: any) {
    this.currentPage = event.page;
    this.list();
  }

  onPageItemsChange(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
  }

   // Filter
  processFilter() {
    let filter = '';
    if (this.filters.id !== '') {
      filter += '&id=' + this.filters.id;
    }
    if (this.filters.description !== '') {
      filter += '&description=' + this.filters.description;
    }
    return filter;
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
}
