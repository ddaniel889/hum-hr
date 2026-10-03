import { Component, OnInit, Input } from "@angular/core";
import { MetadataFind } from "../models/metadata.model";
import { MetadataDocType } from "../models/MetadataDocType.model";

@Component({
  selector: "app-search-custom-control",
  templateUrl: "./search-custom-control.component.html",
  styles: []
})
export class SearchCustomControlComponent implements OnInit {
  @Input() metadata: MetadataDocType;
  @Input() findEntity: MetadataFind[];
  @Input()  enableEnhancedSearch: boolean;
  value: MetadataFind;
  metaValueFrom: any;
  metaValueTo: any;
  searchType = "EqualIgnoreCase";
  noValue = false;

  constructor() { }

  ngOnInit() {
    let metaFdataSearchTypeFrom: string;
    let metaFdataSearchTypeTo: string;
    let nullValue = false;
    let valueFrom: any = null;
    let valueTo: any = null;

    // Chequeo si ya tiene valores precargados
    const meta = this.findEntity.filter(
      m => m.MetadataSystemName === this.metadata.metadataSystemName
    );

    if (meta && meta.length > 0) {
      if (this.metadata.metadataType === 'comboKV' || this.metadata.metadataType === 'combo') {
        this.metadata.optionValues = JSON.parse(
          this.metadata.optionValues.toString()
        );
      }

      nullValue = meta[0].Nullvalue;
      metaFdataSearchTypeFrom = meta[0].MetadataSearchTypeFrom;
      metaFdataSearchTypeTo = meta[0].MetadataSearchTypeTo;
      valueFrom = meta[0].MetadataValueFrom;
      valueTo = meta[0].MetadataValueTo;
    } else {
      // Si es nuevo
      switch (this.metadata.metadataType) {
        case "number":
        case "date":
        case "period":
          metaFdataSearchTypeFrom = "GreaterThanOrEqual";
          metaFdataSearchTypeTo = "LessThanOrEqual";
          break;
        case "comboKV":
          metaFdataSearchTypeFrom = this.metadata.isMultivalue ? "All" : "Equal";
          metaFdataSearchTypeTo = undefined;
          this.metadata.optionValues = JSON.parse(
            this.metadata.optionValues.toString()
          );
          break;
        case "combo":
          metaFdataSearchTypeFrom = "Equal";
          metaFdataSearchTypeTo = undefined;
          break;
        default:
          metaFdataSearchTypeFrom = this.searchType;
          metaFdataSearchTypeTo = undefined;
          break;
      }
    }

    this.value = {
      MetadataSearchTypeFrom: metaFdataSearchTypeFrom,
      MetadataSearchTypeTo: metaFdataSearchTypeTo,
      MetadataSystemName: this.metadata.metadataSystemName,
      Nullvalue: nullValue,
      metadataIsMultivalue: this.metadata.isMultivalue,
      MetadataValueFrom: valueFrom,
      MetadataValueTo: valueTo
    };

    this.metaValueFrom = this.value.MetadataValueFrom;
    this.metaValueTo = this.value.MetadataValueTo;
    this.searchType = this.value.MetadataSearchTypeFrom;
    this.noValue = this.value.Nullvalue;

  }

  setValueFromChange() {
    this.value.MetadataValueFrom = this.metaValueFrom != "" ? this.metaValueFrom : null;
    this.value.Nullvalue = false;
    this.noValue = false;
    this.setValueToFindEntity();
  }

  setValueToChange() {
    this.value.MetadataValueTo = this.metaValueTo != "" ? this.metaValueTo : null;
    this.value.Nullvalue = false;
    this.noValue = false;
    this.setValueToFindEntity();
  }

  searchTypeChange() {
    this.value.MetadataSearchTypeFrom = this.searchType;
    this.setValueToFindEntity();
  }

  NoShowFecDocMetadata(metadataSystemName: string) {

      return metadataSystemName == "_fecDoc";
  }

  setValueToFindEntity() {
    if (
      this.metadata.metadataType === "text" ||
      this.metadata.metadataType === "email"
    ) {
      this.value.MetadataSearchTypeFrom = this.searchType;
    }

    if (this.metadata.metadataType === "number" ||
      this.metadata.metadataType === "period" ||
      this.metadata.metadataType === "date") {
      if (this.value.MetadataValueFrom === null || this.value.MetadataValueTo === null) {
        this.value.MetadataSearchTypeFrom = "Equal";
        this.value.MetadataSearchTypeTo = "Equal";
      } else {
        this.value.MetadataSearchTypeFrom = "GreaterThanOrEqual";
        this.value.MetadataSearchTypeTo = "LessThanOrEqual";
      }
    }

    const meta = this.findEntity.filter(
      m => m.MetadataSystemName === this.value.MetadataSystemName
    );

    if (meta && meta.length > 0) {
      meta[0].MetadataValueFrom = this.value.MetadataValueFrom;
      meta[0].MetadataValueTo = this.value.MetadataValueTo;
      meta[0].MetadataSearchTypeFrom = this.value.MetadataSearchTypeFrom;
      meta[0].MetadataSearchTypeTo = this.value.MetadataSearchTypeTo;
      meta[0].Nullvalue = this.value.Nullvalue;
    } else {
      this.findEntity.push(this.value);
    }
  }

  noValueChange() {
    this.metaValueFrom = undefined;
    this.metaValueTo = undefined;
    this.value.MetadataValueFrom = undefined;
    this.value.MetadataValueTo = undefined;
    this.value.Nullvalue = this.noValue;
    this.setValueToFindEntity();
  }
}
