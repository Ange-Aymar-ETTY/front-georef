import { SocketService } from './services/socket.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Component, OnInit } from '@angular/core';
import { Utilities } from './helpers/utilities';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  titleSpinner: '';

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private socket: SocketService,
    private router: Router
  ) {
    Utilities.Notification.bindEvent('loadingOn', (e) => {
      if (e.detail) {
        this.titleSpinner = e.detail.message;
      }
      this.spinner.show('main-loader');
    });

    Utilities.Notification.bindEvent('loadingOff', () => {
      this.spinner.hide('main-loader');
    });

    Utilities.Notification.bindEvent('show-toaster', (e) => {
      const { title, message } = e.detail;
      this.toastr.success(message, title);
    });

    Utilities.Notification.bindEvent('show-toaster-fail', (e) => {
      const { title, message } = e.detail;
      this.toastr.error(message, title);
    });

    Utilities.Notification.bindEvent('show-toaster-info', (e) => {
      const { title, message } = e.detail;
      this.toastr.info(message, title);
    });
  }

  ngOnInit() {
    this.socket.initSocket();

    this.socket._notif.subscribe(d => {
      if (d && d.data) {
        Utilities.Notification.emitEvent('show-toaster-info', d.data.message);
      }
    });
  }
}
