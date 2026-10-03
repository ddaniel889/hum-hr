import { Component, Inject, OnInit } from '@angular/core';
import { LeaveService } from '../../shared/services/leave.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '../../shared/errorHandler/message.service';
import { LeaveRequest } from '../../shared/models/leave-request.model';

@Component({
  selector: 'app-progress-massive-approve-requests',
  templateUrl: './progress-massive-approve-requests.component.html',
  styleUrls: ['./progress-massive-approve-requests.component.scss']
})
export class ProgressMassiveApproveRequestsComponent implements OnInit {
  todo:boolean=true;
  flag:boolean = false;
  count:number=0;
  percent:any = 0;
  length:number=this.arrIds.length;
  leave: LeaveRequest;
  constructor(
    @Inject(MAT_DIALOG_DATA) public arrIds: [],
    private dialogRef: MatDialogRef<ProgressMassiveApproveRequestsComponent>,   
    private leaveService: LeaveService,
    private msjService: MessageService
  ) {
    
  }
  ngOnInit(): void {
    const arrPromise=[];
    this.dialogRef.afterClosed().subscribe(()=>{this.todo=false;});
    this.dialogRef.afterOpened().subscribe(()=>{this.main();});
    
 }
 excecute(element: any)
 {  
  return new Promise<void>(()=>{        
    this.leave = new LeaveRequest();
    this.leave.id = element;
    this.leaveService.approveOrRejectLeaveRequest(this.leave, true).toPromise().then(
    data => {
      this.count= this.count + 1;
      this.percent = Math.round((this.count/this.length)*100); 
      if(this.count < this.length && this.todo)  
        this.main();
      else
      {
          this.dialogRef.close();
      }      
    },
    err => {
      this.count= this.count + 1;
      this.percent = Math.round((this.count/this.length)*100); 
      if(this.count < this.length && this.todo)  
        this.main();
      else
      {
          this.dialogRef.close();
      }  
    }); 
  });
 }

  main() {
  const element = this.arrIds.shift();
  Promise.all([this.excecute(element)]);    
}

}




