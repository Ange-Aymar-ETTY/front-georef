import { Constantes } from 'src/app/helpers/constantes';
import { TableComponent } from './../../components/table/table.component';
import { UserService } from './../../services/user.service';
import { User } from './../../models/user';
import { FormatColumn } from '../../helpers/interface';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MeterService } from 'src/app/services/meter.service';
import { Subscription } from 'rxjs';
import { Utilities } from 'src/app/helpers/utilities';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.scss']
})
export class UtilisateurComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  // listExploitation: Exploitation[];
  listDrs: [];
  listUsers: User[] = [];
  subscription: Subscription;
  userSelect: User;
  isChecked = false;
  isListSelected = true;
  // isUserSelected = false;
  isUserEdited = false;
  validationMessages = Constantes.validationMessages;

  // var table
  @ViewChild('table') table: TableComponent;
  columnSort = 'id';
  columnDefs: FormatColumn[] = [
    {
      title: 'nom_prenoms',
      libelle: 'Nom & Prénoms',
      type: 'text'
    },
    {
      title: 'email',
      libelle: 'Email',
      type: 'text'
    },
    {
      title: 'directions',
      libelle: 'Directions',
      type: 'text'
    },
    {
      title: 'actions',
      libelle: 'Actions',
      type: 'actions'
    }
  ];

  constructor(private fb: FormBuilder, private _meterService: MeterService, private _userService: UserService, private router: Router) {
    this.userForm = this.fb.group({
      nom_prenoms: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      directions: new FormControl('', [Validators.required]),
      check: new FormControl(false)
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this._userService.getListUser();

    this._userService.user$.subscribe(user => {
      if (user && user.length > 0) {
        this.table.loadDataWithItems(user);
      }
    });

    // this._meterService.getData(`dr/list`).subscribe(d => this.listDrs = d);
    this._meterService.getDrs().subscribe(d => this.listDrs = d);
  }

  checkChange(event: any) {
    this.isChecked = event.target.checked;

    !this.isChecked ? this.userForm.get('directions').enable() : this.userForm.get('directions').disable();
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  createUser() {
    // Utilities.Notification.emitEvent('loadingOn', 'Enregistrement en cours');
    // const user = {
    //   nom_prenoms: this.userForm.value.nom_prenoms,
    //   email: this.userForm.value.email,
    //   directions: null
    // };

    const user = this.userForm.value;
    user.directions = (this.isChecked) ? 'ALL' : this.userForm.value.directions.join(',');

    this._userService.createUser(user)
      // .pipe(finalize(() => Utilities.Notification.emitEvent('loadingOff')))
      .subscribe(data => {
        if (!data.error) {
          Utilities.Notification.emitEvent('show-toaster', data.message);
          this.backToList();
        } else {
          Utilities.Notification.emitEvent('show-toaster-fail', data.message);
        }
      }, () => {
        Utilities.Notification.emitEvent('show-toaster-fail', `Une erreur s'est produite. Veuillez réessayez !`);
      });
  }

  editUser() {
    if (this.userSelect) {
      // Utilities.Notification.emitEvent('loadingOn', 'Modification en cours');
      // const user = {
      //   id: this.userSelect.id,
      //   nom: this.userForm.value.nom,
      //   prenoms: this.userForm.value.prenoms,
      //   matricule: this.userForm.value.matricule,
      //   email: this.userForm.value.email,
      //   exp: null
      // };
      const user = { id: this.userSelect.id, ...this.userForm.value };
      user.directions = (this.isChecked) ? 'ALL' : this.userForm.value.directions.join(',');

      this._userService.editUser(user)
        // .pipe(finalize(() => Utilities.Notification.emitEvent('loadingOff')))
        .subscribe(data => {
          if (data.success) {
            Utilities.Notification.emitEvent('show-toaster', data.message);
            this.backToList();
          } else {
            Utilities.Notification.emitEvent('show-toaster-fail', data.message);
          }
        }, () => {
          Utilities.Notification.emitEvent('show-toaster-fail', `Une erreur s'est produite. Veuillez réessayez !`);
        });
    }
  }

  selectDeleteUser() {
    if (this.userSelect) {
      const showAlert = Utilities.Notification.showAlertWithOk('Voulez-vous vraiment supprimer cet utilisateur ?', 'question');

      showAlert.then(res => {
        if (res.value) {
          // Utilities.Notification.emitEvent('loadingOn', 'Modification en cours');
          this._userService.deleteUser(this.userSelect.id)
            // .pipe(finalize(() => Utilities.Notification.emitEvent('loadingOff')))
            .subscribe(data => {
              if (data.success) {
                Utilities.Notification.emitEvent('show-toaster', data.message);
                this.backToList();
              } else {
                Utilities.Notification.emitEvent('show-toaster-fail', data.message);
              }
            }, () => {
              Utilities.Notification.emitEvent('show-toaster-fail', `Une erreur s'est produite. Veuillez réessayez !`);
            });
        }
      });
    }
  }

  backToList() {
    this.isListSelected = true;
    this.isUserEdited = false;
    // this.isUserSelected = false;
    this.userForm.reset();
    this.userSelect = null;
    this.table.resetDisplayTable();
  }

  getSelectedData(d: any) {
    this.userSelect = d.data;

    if (d.action) {
      if (d.action == 'edit') {
        this.selectEditUser();
      } else {
        this.selectDeleteUser();
      }
    }
  }

  selectEditUser() {
    if (this.userSelect) {
      this.isUserEdited = true;
      this.isListSelected = false;

      this.userForm.patchValue({ nom_prenoms: this.userSelect.nom_prenoms, email: this.userSelect.email });

      if (this.userSelect.directions === 'ALL') {
        this.userForm.patchValue({ check: true });
      } else {
        this.userForm.patchValue({ check: false, directions: this.userSelect.directions.split(',') });
      }
    }
  }
}
