import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentSignMassiveComponent } from './document-sign-massive.component';


const routes: Routes = [{
  path: '',
  component: DocumentSignMassiveComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentSignMassiveRoutingModule { }
