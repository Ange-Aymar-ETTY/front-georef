import { APIResponse } from '../../helpers/interface';
import { ImportService } from './import.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpEventType } from '@angular/common/http';
import { Utilities } from 'src/app/helpers/utilities';
import { excelReader } from 'src/app/helpers/utilities/file-checker';
import * as _ from "lodash";

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  @Input() service: string;
  @Input() filePath: any;
  @Input() extension: Array<string>;
  @Input() maxSize = 5;
  @Input() schema = null;

  @Output() dataOutput = new EventEmitter<any>();

  uploadValidationError: any;
  uploadProgress: number;
  uploadSub: Subscription;
  file: File;
  rows: any;

  constructor(private importService: ImportService) { }

  ngOnInit() {}

  downloadFile() {
    if (this.filePath) {
      window.open(`${environment.apiUrl}/${this.filePath}`, '_self');
    }
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      const fileUploaded = event.target.files[0];
      const sizeFile = Math.ceil(fileUploaded.size / 2 ** 20);

      const ext = (fileUploaded.name) ? fileUploaded.name.split('.').slice(-1)[0].toLowerCase() : '';

      // check size and extension of file
      if (sizeFile < this.maxSize && this.extension.includes(ext)) {
        // check data of file
        excelReader(fileUploaded, this.schema).then(({ rows, errors }) => {
          // if data has not errors
          if (rows.length != 0 && errors.length == 0) {
            console.log('Rows', rows);

            this.file = fileUploaded;
            this.rows = rows;
            this.uploadValidationError = false;
          } else {
            console.log('Errors', errors);

            if (rows.length == 0) {
              this.uploadValidationError = `Aucune donnée dans le fichier`;
            }

            if (errors.length != 0) {
              const rowsError = _.uniq(errors.map(o => Number(o.row + 1))).join(", ");
              this.uploadValidationError = `${errors.length} erreur(s) détectée(s) dans le fichier. Ligne(s) : ${rowsError}`;
            }
          }
        });
      } else {
        if (sizeFile > this.maxSize) {
          this.uploadValidationError = `La taille doit être inférieure à ${this.maxSize} Mb`;
        }

        if (!this.extension.includes(ext)) {
          this.uploadValidationError = `L'extension doit être du type ${this.extension.join(', ')}`;
        }
      }
    }
  }

  importFile() {
    if (this.file) {
      this.uploadSub = this.importService.sendFile(this.service, this.file)
        .subscribe(
          (event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress:
                this.uploadProgress = Math.round(100 * (event.loaded / event.total));
                break;

              case HttpEventType.Response:
                const response = event.body as APIResponse;
                if (!response.error) {
                  Utilities.Notification.emitEvent('show-toaster', 'Votre fichier a été chargé. Il est en cours de traitemant.');
                  // this.fileImport.setValue(null);
                  this.file = null
                } else {
                  Utilities.Notification.emitEvent('show-toaster-fail', response.message);
                }
                setTimeout(() => this.cancelUpload(), 1500);
                break;
            }
          },
          err => {
            Utilities.Notification.emitEvent('show-toaster-fail', 'Une erreur est survenue lors du traitement de votre demande.');
          }
        );
    }
  }

  importRows() {
    if (this.rows) {
      this.importService.sendRows(this.service, this.rows)
        .subscribe(({ error, message, data }) => {
          this.dataOutput.emit(data);
          if (!error) {
            Utilities.Notification.emitEvent('show-toaster', 'Le fichier a bien été importé. Il est en cours de traitemant.');
            this.file = null;
          } else {
            Utilities.Notification.emitEvent('show-toaster-fail', message);
          }
        }, (e) => {
          Utilities.Notification.emitEvent('show-toaster-fail', 'Une erreur est survenue lors du traitement de votre demande.')
        });
    }
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
