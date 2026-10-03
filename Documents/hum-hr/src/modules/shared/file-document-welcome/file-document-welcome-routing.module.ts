import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileDocumentWelcomeComponent } from './file-document-welcome.component';

const routes: Routes = [
  {
    path: '',
    component: FileDocumentWelcomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileDocumentWelcomeRoutingModule { }
