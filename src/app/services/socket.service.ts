import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { User } from '../models/user';
import { AuthService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  user: User;

  constructor(private socket: Socket, private authService: AuthService) {
    this.authService.currentUser.subscribe(d => this.user = d);
  }

  // _fileBack = this.socket.fromEvent<any>('file-back');
  _notif = this.socket.fromEvent<any>('notification');

  initSocket() {
    if (this.user) {
      this.socket.on('connect', () => {
        this.socket.emit('handshake', { key: this.user.key });
      });
    }
  }
}
