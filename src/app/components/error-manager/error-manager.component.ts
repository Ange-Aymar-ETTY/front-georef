import { FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-error-manager',
  templateUrl: './error-manager.component.html',
  styleUrls: ['./error-manager.component.scss']
})
export class ErrorManagerComponent implements OnInit {

  @Input() validationMessage: any;
  @Input() formCtrl: FormControl;

  constructor() { }

  ngOnInit() {
  }

}
