import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input
} from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { MessageService } from '../../shared/errorHandler/message.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, ContainerType } from '../../shared/models';
import { Observable, forkJoin } from 'rxjs';
import { RoleService } from '../../shared/services/role.service';
import { ContainerTypeService } from '../../shared/services/container-type.service.';

@Component({
  selector: 'app-employee-rrhh-edit',
  templateUrl: './employee-rrhh-edit.component.html',
  styleUrls: []
})

export class EmployeeRrhhEditComponent implements OnInit {
  private _userId: Number;
  public roles: any[];
  public clickOnce = true;
  public selectedUser = new User();
  organizationalUnitId: string;
  containerType: ContainerType;

  @Output() editFinish = new EventEmitter<boolean>();
  msjService: any;

  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private roleService: RoleService,
    private containerTypeService: ContainerTypeService
  ) { }

  @Input()
  set user(userId: Number) {
    this.selectedUser = new User();
    this.roles = [];
    this._userId = userId;
    forkJoin(
      this.userService.getById(userId)
    ).subscribe(
      res => {
        this.selectedUser = res[0];
        this.clickOnce = false;
      },
      err => {
        this.messageService.showError(err);
        this.clickOnce = false;
      });
  }

  get user(): Number {
    return this._userId;
  }

  ngOnInit() {
    this.organizationalUnitId = localStorage.getItem("organizationId");

    this.containerTypeService
      .getContainerType(this.organizationalUnitId)
      .toPromise()
      .then(containerType => {
        this.containerType = containerType;
      },
        err => {
          this.msjService.showError(err);
        }
      );
  }

  save() {
    this.selectedUser.mailConfirm = this.selectedUser.mail;
    if (this.selectedUser.nickName.trim() == '' || this.selectedUser.nickName == null) {
      this.selectedUser.nickName = this.selectedUser.mail;
    }
    this.clickOnce = true;
    this.userService
      .update(this.selectedUser)
      .subscribe(
        res => {
          this.clickOnce = false;
          this.editFinish.emit(true);
        },
        err => {
          this.messageService.showError(err);
          this.clickOnce = false;
        });
  }

  cancel() {
    this.editFinish.emit(false);
  }
  validateData(): boolean {
   return this.selectedUser.firstName === '' || this.selectedUser.lastName === '' || this.selectedUser.mail === '';
  }
}
