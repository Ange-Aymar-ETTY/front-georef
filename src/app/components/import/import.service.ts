import { SendService } from '../../services/send.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor(private sendService: SendService) { }

  sendFile(service: string, file: File) {
    const formData = new FormData();
    formData.append('sampleFile', file);

    return this.sendService.postFile(formData, service);
  }

  sendRows(service: string, data: any) {
    return this.sendService.post(data, service);
  }
}
