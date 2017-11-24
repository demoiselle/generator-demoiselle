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

  // states
  public isLoading = true;

  // Pagination
  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public currentPage: number = 1;

  // Filter
  public ascValue = '⇧';
  public descValue = '⇩';
  public formOrder = {<% properties.forEach(function (property){ %>
      <%= property.name %>: '',<% });%>
  };
  public filterActive = true;
  public filters = {<% properties.forEach(function (property){ %>
      <%= property.name %>: '',<% });%>
  };

  public selecteds = [];

  constructor(private service: <%= name.capital %>Service, private notificationService: NotificationService) {
  }

  ngOnInit() {
    console.debug('[<%= name.capital %>Component] created.');
    this.isLoading = false;

    // populate table
    this.list();
  }

  list(field: string = null, desc: boolean = false) {
    this.isLoading = true;
    const filter = this.processFilter();
    this.service.list(this.currentPage, this.itemsPerPage, filter, field, desc)
      .subscribe((result) => {
        try {
          this.<%= name.lower %>s = result.json();
        } catch (e) {
          console.log('Can not convert result to JSON.');
          console.log(e);
          this.<%= name.lower %>s = [];
        }
        const contentRange = result.headers.get('Content-Range');
        if (contentRange) {
          this.totalItems = Number(contentRange.substr(contentRange.indexOf('/')+1, contentRange.length));
        }
      },
      (error) => {
        console.error(error);
        this.notificationService.error('Não foi possível carregar a lista de itens!');
      },
      () => {
        console.debug('<%= name.capital %>Component.list() - completed.');
        this.isLoading = false;
      }
    );
  }

  delete(<%= name.lower %>: <%= name.capital %>) {
    this.isLoading = true;
    this.service.delete(<%= name.lower %>).subscribe(
      (result) => {
        this.<%= name.lower %> = null;
        this.staticModalDelete.hide();
        this.notificationService.success("<%= name.capital %> removido com sucesso!");
        this.list();
      },
      (error) => {
        console.error(error);
        this.notificationService.error('Não foi possível remover!');
      },
      () => {
        console.debug('<%= name.capital %>Component.delete() - completed.');
        this.isLoading = false;
      }
    );
  }

  deleteSelecteds() {
    this.selecteds.map(selectedItem => {
      this.delete(selectedItem);
    });
  }

  toggleSelected(<%= name.lower %>: <%= name.capital %>) {
    let index = this.selecteds.indexOf(<%= name.lower %>);
    if(index === -1) {
      this.selecteds.push(<%= name.lower %>);
    } else {
      this.selecteds.splice(index, 1);
    }
  }

  showModalDelete() {
    if(this.selecteds.length > 0) {
      this.staticModalDelete.show();
    } else {
      console.warn('Nenhum item selecionado.');
    }
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
    for (let key in this.filters) {
      if (this.filters[key] !== '') {
        filter += `&${key}=${this.filters[key]}`;
      }
    }

    return filter;
  }

  orderBy(field) {
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
