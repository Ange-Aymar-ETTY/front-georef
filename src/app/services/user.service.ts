import { APIResponse } from '../helpers/interface';
import { User } from './../models/user';
import { SendService } from './send.service';
import { Injectable } from '@angular/core';
import { map, retry } from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User[]>([]);
  readonly user$ = this.userSubject.asObservable();
  private listUsers: User[] = [];

  constructor(private sendService: SendService) {
    // this.sendService.get('user/list')
    //   .pipe(retry(3))
    //   .subscribe((d: APIResponse) => {
    //     if (!d.error) {
    //       this.listUsers = d.data;
    //       this.ListUserSubject.next(d.data);
    //     }
    //   });
  }

  getListUser() {
    return this.sendService.get('user/list')
      .pipe(retry(3))
      .subscribe((d: APIResponse) => {
        if (!d.error) {
          this.listUsers = d.data;
          this.userSubject.next(this.listUsers);
        }
      });
  }

  createUser(user: any) {
    return this.sendService.post(user, 'user/create').pipe(
      map((d: APIResponse) => {
        if (!d.error) {
          this.listUsers.push(d.data);
          this.userSubject.next(this.listUsers);

          return { error: false, message: d.message };
        }
        return { error: true, message: d.message };
      })
    );
  }

  editUser(user: any) {
    return this.sendService.post(user, 'user/update')
      .pipe(
        map((d: APIResponse) => {
          if (!d.error) {
            const i = this.listUsers.findIndex(obj => obj.id === d.data.id);
            this.listUsers[i] = d.data;

            this.userSubject.next(this.listUsers);
            return { success: true, message: d.message };
          }
          return { success: false, message: d.message };
        })
      );
  }

  deleteUser(id: number) {
    return this.sendService.post({ id }, 'user/delete')
      .pipe(
        map((d: APIResponse) => {
          if (!d.error) {
            const i = this.listUsers.findIndex(obj => obj.id === id);
            this.listUsers.splice(i, 1);

            this.userSubject.next(this.listUsers);
            return { success: true, message: d.message };
          }
          return { success: false, message: d.message };
        })
      );
  }

  changePassword(
    data: {
      id: number,
      ancien_pwd: string,
      nouveau_pwd: string
    }
  ) {
    return this.sendService.post(data, 'user/change-password');
  }

}
