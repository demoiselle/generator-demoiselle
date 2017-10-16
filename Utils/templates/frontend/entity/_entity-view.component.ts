import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../shared';
import { <%= name.capital %> } from './<%= name.lower %>.model';
import { <%= name.capital %>Service } from './<%= name.lower %>.service';

@Component({
  selector: '<%= prefix.lower %>-<%= name.lower %>-view',
  templateUrl: './<%= name.lower %>-view.component.html'
})
export class <%= name.capital %>ViewComponent implements OnInit {
  <%= name.lower %>: <%= name.capital %> = new <%= name.capital %>();

  @ViewChild('staticModalDelete') public staticModalDelete: ModalDirective;

  private routeSubscribe: any;

  constructor(
    private service: <%= name.capital %>Service,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router)
  { }

  ngOnInit() {
    if (this.route.snapshot.data['<%= name.lower %>']) {
      this.<%= name.lower %> = this.route.snapshot.data['<%= name.lower %>'];
    }
  }

  goBack() {
    this.router.navigate(['<%= name.lower %>']);
  }

  delete(<%= name.lower %>: <%= name.capital %>) {
    this.service.delete(<%= name.lower %>).subscribe(
      (result) => {
        this.<%= name.lower %> = null;
        this.staticModalDelete.hide();
        this.goBack();
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

}
