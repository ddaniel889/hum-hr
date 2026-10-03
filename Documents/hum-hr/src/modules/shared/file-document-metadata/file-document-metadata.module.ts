import { NgModule } from "@angular/core";
import { FileDocumentMetadataComponent } from "./file-document-metadata.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MyMaterialModule } from "src/app/app.material";
import { ClipboardModule } from 'ngx-clipboard';
import { FileDocumentStateModule } from '../file-document-state/file-document-state.module';


@NgModule({
  declarations: [FileDocumentMetadataComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatToolbarModule,
    MyMaterialModule,
    FlexLayoutModule,
    ClipboardModule,
    FileDocumentStateModule,
  ],
  exports: [FileDocumentMetadataComponent]
})
export class FileDocumentMetadataModule { }
