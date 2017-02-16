import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

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

  @ViewChild('staticModal') public staticModal: ModalDirective;

  public itemsPerPage: number = 10;
  public totalItems: number = 0;
  public currentPage: number = 1;

  constructor(private service: <%= name.capital %>Service, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.list();
  }

  showModalDetails(<%= name.lower %>: <%= name.capital %>) {
    this.<%= name.lower %> = <%= name.lower %>;
    this.staticModal.show();
  }

  pageChanged(event: any): void {
    this.currentPage = event.page;
    this.list();
  }

  list() {
    this.service.list(this.currentPage, this.itemsPerPage).subscribe(
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

  edit(<%= name.lower %>:<%= name.capital %>) {
    this.service.update(<%= name.lower %>).subscribe(
      (result) => {
        this.notificationService.success('Item atualizado com sucesso!');
      },
      (error) => {
        this.notificationService.error('Não foi possível salvar!');
      }
    );
  }

  delete(<%= name.lower %>: <%= name.capital %>) {
    this.service.delete(<%= name.lower %>).subscribe(
      (result) => {
        this.<%= name.lower %> = null;
        this.staticModal.hide();
        this.list();
      },
      (error) => {
        this.notificationService.error('Não foi possível remover!');
      }
    );
  }
}
