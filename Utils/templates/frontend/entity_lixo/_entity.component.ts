import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { NotificationService } from '../shared';
import { <%= name.capital %>Service } from './<%= name.kebab %>.service';
import { <%= name.capital %> } from './<%= name.kebab %>.model';

@Component({
  selector: '<%= prefix.kebab %>-<%= name.kebab %>',
  templateUrl: './<%= name.kebab %>.component.html',
  styleUrls: ['./<%= name.kebab %>.component.scss']

})
export class <%= name.capital %>Component implements OnInit {
  <%= name.kebab %>: <%= name.capital %>;
  <%= name.kebab %>s: <%= name.capital %>[];

  @ViewChild('staticModal') public staticModal: ModalDirective;

  public itemsPerPage: number = 1;
  public totalItems: number = 0;
  public currentPage: number = 1;

  constructor(private service: <%= name.capital %>Service, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.list();
  }

  showModalDetails(<%= name.kebab %>: <%= name.capital %>) {
    this.<%= name.kebab %> = <%= name.kebab %>;
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
        this.<%= name.kebab %>s = result.json();
        let contentRange = result.headers.get('Content-Range');
        this.totalItems = Number(contentRange.substr(contentRange.indexOf('/')+1, contentRange.length));
      },
      (error) => {
        this.notificationService.error('Não foi possível carregar a lista de itens!');
        this.totalItems = 20;
        this.<%= name.kebab %>s = error;
      }
    );
  }

  edit(<%= name.kebab %>:<%= name.capital %>) {
    this.service.update(<%= name.kebab %>).subscribe(
      (result) => {
        this.notificationService.success('Item atualizado com sucesso!');
      },
      (error) => {
        this.notificationService.error('Não foi possível salvar!');
      }
    );
  }

  delete(<%= name.kebab %>: <%= name.capital %>) {
    this.service.delete(<%= name.kebab %>).subscribe(
      (result) => {
        this.<%= name.kebab %> = null;
        this.staticModal.hide();
        this.list();
      },
      (error) => {
        this.notificationService.error('Não foi possível remover!');
      }
    );
  }
}
