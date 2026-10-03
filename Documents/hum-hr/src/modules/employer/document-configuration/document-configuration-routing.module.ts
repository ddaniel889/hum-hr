import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentConfigurationComponent } from './document-configuration.component';


const routes: Routes = [
  {
    path: '',
    component: DocumentConfigurationComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentConfigurationRoutingModule { }
