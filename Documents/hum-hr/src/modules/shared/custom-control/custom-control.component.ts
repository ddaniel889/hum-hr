import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MessageService } from "../errorHandler/message.service";
import { MetadataDocType } from "../models/MetadataDocType.model";
import { FileDocumentMetadata } from "../models/file-document-metadata.model";
import { ContainerType } from '../models/container-type.model';
import { AuthService } from "../auth/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { AddMetadataValueDialogComponent } from '../../employer/add-metadata-value-dialog/add-metadata-value-dialog.component';
import { AddMetadataItem } from "../models/metadata.model";
import { EditMetadataValueDialogComponent } from "../../employer/edit-metadata-value-dialog/edit-metadata-value-dialog.component";

@Component({
  selector: "app-custom-control",
  templateUrl: "./custom-control.component.html",
  styles: []
})
export class CustomControlComponent implements OnInit {
  @Input() metadata: MetadataDocType;
  @Input() showAdd = false;
  @Input() containerType: ContainerType;
  @Input() aditionalsmetadatas: any[];
  @Input() isDisabled = false;
  @Input() assistedIndex: any;
  @Input() isAssisted: boolean = false;
  @Output() valueSet = new EventEmitter<FileDocumentMetadata>();
  @Output() newValueAdded = new EventEmitter<AddMetadataItem>();
  @Output() comboEdited = new EventEmitter<any>();

  value: FileDocumentMetadata;
  metaDef: any;
  isRRHHManagment: boolean;

  constructor(private msjService: MessageService,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.isRRHHManagment = this.authService.RRHHManagment();
    // Si tengo el type saco los options de ahí
    // TODO: El dia que usemos esto para documentos agregar una entidad base de documentType y ContainerType
    if (this.containerType) {
      const sysName = this.metadata.metadataSystemName ? this.metadata.metadataSystemName : this.metadata.systemName;
      this.metaDef = this.containerType.metadata.find(m => m.metadataSystemName === sysName);
    } else {
      // Si no tengo la definicion uso lo que se venia usando antes
      this.metaDef = this.metadata;
    }

    // Get current value
    if (this.metadata && this.aditionalsmetadatas) {
      const metaValues = this.aditionalsmetadatas.filter(
        data => data.metadataId === this.metadata.metadataId
      );

      if (this.metaDef.metadataMask && this.metaDef.metadataMask.length > 0) {
        this.metaDef.metadataMask = this.replaceMask(this.metaDef.metadataMask);
      }
      if ((this.metaDef.metadataType === 'comboKV' || this.metaDef.metadataType === 'combo') && !Array.isArray(this.metaDef.optionValues)) {
        this.metaDef.optionValues = JSON.parse(
          this.metaDef.optionValues.toString()
        );
      }

      if (metaValues.length < 1) {
        if (!this.value) {
          this.value = new FileDocumentMetadata();
        }
        this.value.asName = this.metadata.asName;
        this.value.metadataId = this.metadata.metadataId;
        this.value.metadataIsRequired = this.metadata.isRequired;
        this.value.metadataIsUnique = this.metadata.isUnique;
        this.value.metadataLabel = this.metadata.metadataLabel;
        this.value.metadataType = this.metadata.metadataType;
        this.value.metadataValue = this.metadata.metadataValue;
        this.value.metadataValueDescription = this.metadata.metadataValueDescription;
        this.value.position = this.metadata.position;
        this.value.systemName = this.metadata.systemName;
        return;
      }

      if (metaValues.length > 1) {
        this.msjService.showError(
          `Hay más de un valor de dato definido para el dato: ${this.metaDef.metadataLabel}`
        );
        return;
      }

      this.value = metaValues[0];
      if (metaValues[0].metadataValue) {
        this.setMetadataValueDescription(metaValues[0].metadataValue);
      }

      if (
        this.metadata.metadataType === "comboKV" ||
        this.metadata.metadataType === "combo"
      ) {

        if (this.metadata.metadataValue && this.metaDef.isMultivalue && !Array.isArray(this.metadata.metadataValue)) {
          this.metadata.metadataValue = JSON.parse(this.metadata.metadataValue);
          this.value.metadataValue = this.metadata.metadataValue;
        }
      }
    }
  }

  replaceMask(mask: string): string {
    const m = this.replaceAll(mask, /\*/g, 'A');

    return this.replaceAll(m, '9', '0');
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  translateStringNullToNull(str: string) {
    if (str === null) return null;
    if (str == 'null') return null;
    return str;
  }

  getValue() {
    return this.value.metadataValue;
  }

  // Este método se ejecuta desde la modificación del formulario para setear el valor
  // y desde el inicio para que si no setea nada el valor quede igual que antes.
  setValue(val) {
    if (val) {
      // Si el valor seteado es igual al que ya tenia no hago nada salvo que me pasen el parametro force = true.
      if (val === this.value.metadataValue) {
        return;
      }

      if (val.value || this.metadata.metadataType === "comboKV") {
        // Asigno el valor del value con el del formulario
        if (Array.isArray(val.value) && val.value.indexOf(undefined) > -1) {
          val.value = undefined;
        }
        this.value.metadataValue = val.value;
        if (this.metadata.metadataType === "comboKV") {
          // Si es un metadato tipo combo le genero la descripcion a mostrar
          this.setMetadataValueDescription(val.value);
        }
      } else {
        this.value.metadataValue = this.metadata.metadataType === 'date' ? undefined : val;
      }
    } else {
      this.value.metadataValue = undefined;
    }
    this.valueSet.emit(this.value);
  }

  // Genero la descripcion a mostrar de los metadatos tipo combo
  private setMetadataValueDescription(val: any) {
    if (!val) {
      this.value.metadataValueDescription = "";
      return;
    }
    if (this.metaDef.isMultivalue) {
      const data = [];
      if (!Array.isArray(val)) {
        val = JSON.parse(val);
      }

      val.forEach(value => {
        data.push(
          this.metaDef.optionValues.find(z => z.value === value)
            .description
        );
      });
      this.value.metadataValueDescription = data.toString();
    } else {
      this.value.metadataValueDescription = this.metaDef.optionValues?.find(
        z => z.value == val
      ).description;
    }
  }

  openAddMetadataValue() {
    const dialogRef = this.dialog.open(AddMetadataValueDialogComponent, { data: this.metaDef });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.newValueAdded.emit(result);
      }
    });
  }

  openEditMetadataValue(option: any) {
    const parameters = {
      metadataDef: this.metaDef,
      editValue: option
    };
    const dialogRef = this.dialog.open(EditMetadataValueDialogComponent, { data: parameters });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.comboEdited.emit(result);
      }
    });
  }
}
