import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeFileDocumentViewComponent } from './employee-file-document-view.component';

const routes: Routes = [
  {
    path: '',
    component: EmployeeFileDocumentViewComponent,
    children: [],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeFileDocumentRoutingModule { }
