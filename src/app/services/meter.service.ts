import { APIResponse } from '../helpers/interface';
import { map, retry, timeout } from 'rxjs/operators';
import { SendService } from './send.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MeterService {
  constructor(private sendService: SendService) { }

  getData(endpoint: string) {
    return this.sendService.get(endpoint).pipe(
      retry(2),
      map(response => response.data)
    );
  }

  // getExploitations() {
  //   return this.sendService.get(`exploitation/list`)
  //     .pipe(retry(3), map((response: APIResponse) => response.data));
  // }

  getDrs() {
    return this.sendService.get(`dr/list`).pipe(
      retry(2),
      map(response => response.data)
    )
  }

  // getZones() {
  //   return this.sendService.get(`zone/list`).pipe(
  //     retry(3),
  //     map((response: APIResponse) => response.data)
  //   );
  // }

  // getTournees() {
  //   return this.sendService.get(`tournee/list`).pipe(
  //     retry(3),
  //     map((response: APIResponse) => response.data),
  //   );
  // }

  // getAgences() {
  //   return this.sendService.get(`agence/list`).pipe(
  //     retry(3),
  //     map((response: APIResponse) => response.data)
  //   );
  // }

  getPolygones(data: { data: any }) {
    return this.sendService.post(data, 'polygone').pipe(
      map((response: APIResponse) => response.data)
    );
  }

  searchMeter(data: { column: string, value: string }) {
    return this.sendService.post(data, `search`)
      .pipe(
        map((response: APIResponse) => response.data)
      );
  }

  metersbycode(data: { column: string, value: string }) {
    return this.sendService.post(data, 'meter/code/list').pipe(
      map((response: APIResponse) => response.data)
    );
  }

  sendMessage(data: { numero, meters }) {
    return this.sendService.post(data, 'sendmessage');
  }

  getDataRequest(id) {
    return this.sendService.get(`demande/data?_id=${id}`);
  }

  getAgentsByDr(dr: string) {
    return this.sendService.get(`list/agents?dr=${dr}`);
  }

  sendMatricule(data) {
    return this.sendService.post(data, 'update/agents');
  }

  getMeterInDraw(data) {
    return this.sendService.post(data, 'points_into')
      // .pipe(timeout(300000));
  }
}
