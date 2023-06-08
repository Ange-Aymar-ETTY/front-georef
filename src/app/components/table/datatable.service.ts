import { APIResponse, TableFilter } from './../../helpers/interface';
import { SendService } from '../../services/send.service';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DatatableService {

  constructor(private sendService: SendService) { }

  getDataForTable(
    service: string,
    sort: string,
    order: string,
    page: number,
    size: number,
    filter: TableFilter
  ) {
    const params = { sort, order, page, size, dataFilter: filter };

    return this.sendService.post(params, service).pipe(
      map((d: APIResponse) => d.data),
    );
  }
}
