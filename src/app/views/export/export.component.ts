import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Schema } from 'read-excel-file';
import { FormShareComponent } from 'src/app/components/modal/form-share/form-share.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { Constantes } from 'src/app/helpers/constantes';
import { FormatColumn } from 'src/app/helpers/interface';
import { Utilities } from 'src/app/helpers/utilities';
import { ExcelAdapter } from 'src/app/helpers/utilities/excel-adapter';
import { MeterService } from 'src/app/services/meter.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  @ViewChild('dataTable') dataTable: TableComponent;

  columnDefs: FormatColumn[] = [
    {
      title: 'createdAt',
      libelle: 'Date',
      type: 'date'
    },
    {
      title: 'statutLibelle',
      libelle: 'Statut',
      type: 'text'
    }
  ];
  columnSort = 'createdAt';

  schema: Schema = {
    'adresse_technique': {
      prop: 'adresse_technique',
      type: String,

    },
    'numero_compteur': {
      prop: 'numero_compteur',
      type: String,
    }
  };

  isForm = true;
  dataSelect: any;
  // importForm: FormGroup;
  validationMessages = Constantes.validationMessages;

  constructor(private _meterService: MeterService, private dialog: MatDialog) {
    // this.importForm = new FormGroup({
    //   libelle: new FormControl('', [Validators.required])
    // });
  }


  ngOnInit(): void {
  }

  getSelectedData({ data }) {
    this.dataSelect = data;
  }

  downloadFile() {
    if (this.dataSelect?.id) {
      this._meterService.getDataRequest(this.dataSelect.id)
        .subscribe(({ error, data }) => {
          if (!error) {
            if (data.data?.length > 0) {
              ExcelAdapter.arrayToExcel(data.data);
            }
          }
        })
    }
  }

  opneShareForm() {
    if (this.dataSelect) {
      const dialogShare = this.dialog.open(FormShareComponent, {
        data: { id: this.dataSelect.id }
      });

      dialogShare
        .afterClosed()
        .subscribe((result: { error: boolean, message }) => {
          if (result) {
            if (!result.error) {
              Utilities.Notification.emitEvent('show-toaster', result.message || "L'attribution a été faite avec succès");
            } else {
              Utilities.Notification.emitEvent('show-toaster-fail', result.message || "Echec lors de l'attribution des données");
            }
          }
        });
    }
  }

  backTo() {
    this.isForm = !this.isForm;
    this.dataSelect = null;
    this.dataTable.resetDisplayTable();
  }

  getDataOutput(event) {
    this.dataTable.refresh();
  }
}
