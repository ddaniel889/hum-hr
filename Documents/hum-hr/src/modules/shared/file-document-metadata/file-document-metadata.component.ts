import { Component, OnInit, Inject, Input } from "@angular/core";
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from "@angular/material/bottom-sheet";
import { FileDocument } from "../models/file-document.model";
import { FileDocumentMetadata } from "../models/file-document-metadata.model";
import { MessageService } from "../../shared/errorHandler/message.service";
import { DatePipe } from "@angular/common";
import { ClipboardService } from "ngx-clipboard";

@Component({
  selector: "app-file-document-metadata",
  templateUrl: "./file-document-metadata.component.html",
  styles: [],
})
export class FileDocumentMetadataComponent implements OnInit {
  headerCreatedByMessageInfo = "";
  otrosMetadatos: boolean = false;
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      doc: FileDocument;
      showOtrosMetadatos: boolean;
    },
    private msjService: MessageService,
    private clipboardService: ClipboardService,
    private bottomSheetRef: MatBottomSheetRef<FileDocumentMetadataComponent>
  ) {
    this.otrosMetadatos = data.showOtrosMetadatos;
    const resp =
      this.data.doc.createdByFirstName !== null &&
      this.data.doc.createdByFirstName !== undefined;
    if (resp) {
      this.headerCreatedByMessageInfo = ` - Creado por: ${this.data.doc.createdByFirstName} ${this.data.doc.createdByLastName}`;
    } else {
      this.headerCreatedByMessageInfo = "";
    }
  }

  ngOnInit() {
    this.clipboardService.copyResponse$.subscribe((res) => {
      if (res.isSuccess) {
        this.msjService.showInfo(res.content + " copiado.");
      }
    });
  }

  cancel() {
    this.bottomSheetRef.dismiss();
  }

  metadataIcon(meta: FileDocumentMetadata): string {
    switch (meta.metadataType) {
      case "text":
        return "fa-font";
        break;
      case "number":
        return "fa-hashtag";
        break;
      case "comboKV":
        return "fa-table";
        break;
      case "date":
        return "fa-calendar";
        break;
      default:
        return "fa-info-circle";
    }
  }
}
