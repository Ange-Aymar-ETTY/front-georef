import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constantes } from 'src/app/helpers/constantes';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/authentication.service';
import { MeterService } from 'src/app/services/meter.service';

@Component({
  selector: 'app-form-share',
  templateUrl: './form-share.component.html',
  styleUrls: ['./form-share.component.scss']
})
export class FormShareComponent implements OnInit {
  user: User;
  shareForm: FormGroup;
  ListDrs: any[];
  ListAgents: any[];
  validationMessages = Constantes.validationMessages;
  messageError = null;

  constructor(
    public dialogRef: MatDialogRef<FormShareComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _authService: AuthService,
    private _meterService: MeterService
  ) {
    this.shareForm = new FormGroup({
      dr: new FormControl('', [Validators.required]),
      agent: new FormControl('', [Validators.required])
    });

    this._authService.currentUser.subscribe(d => {
      if (d) {
        this.user = d;
      }
    });
  }

  ngOnInit(): void {
    // if (Array.isArray(this.user?.directions)) {
    //   this.ListDrs = this.user.directions;
    // } else {
    //   this._meterService.getData(`dr/list`).subscribe(d => this.ListDrs = d);
    // }

    this._meterService.getDrs().subscribe(d => this.ListDrs = d);

    this.shareForm.get('dr').valueChanges.subscribe(dr => {
      if (dr) {
        this._meterService.getAgentsByDr(dr)
          .subscribe(({ error, data, message }) => {
            if (!error) {
              this.messageError = null;
              this.ListAgents = data.exploitations;
            } else {
              this.messageError = message;
            }
          });
      }
    });
  }

  get firstValue() {
    return String(this.shareForm.get('agent').value?.[0]?.nom + ' ' + this.shareForm.get('agent').value?.[0]?.prenom).toUpperCase();
  }

  onShare() {
    if (this.shareForm.valid) {
      const { agent } = this.shareForm.value;
      const data = {
        id: this.data.id,
        matricule: agent.map(x => x.matricule)
      };

      this._meterService.sendMatricule(data)
        .subscribe(({ error, message, data }) => {
          this.dialogRef.close({ error, message })
        });
    }
  }
}
