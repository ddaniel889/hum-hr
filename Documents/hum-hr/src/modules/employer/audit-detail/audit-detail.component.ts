import { Component, Inject, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Audit } from '../../shared/models/audit.model';

@Component({
  selector: 'app-audit-detail',
  templateUrl: './audit-detail.component.html',
  styles: [
  ]
})
export class AuditDetailComponent implements OnInit, OnChanges {
  @Input() audit: Audit;

  entity: any;
  properties: string[] = [];
  arrays: string[] = [];
  notArrays: string[] = [];
  haveData = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.audit) {
      this.entity = JSON.parse(this.audit.entity);
      this.parseMetadata();
      this.properties = Object.getOwnPropertyNames(this.entity);
      this.arrays = this.properties.filter(p => Array.isArray(this.entity[p]));
      this.notArrays = this.properties.filter(p => !Array.isArray(this.entity[p]));
      this.haveData = this.arrays.length > 0 || this.notArrays.length > 0;
    }
  }
  private parseMetadata(){
    if(this.entity?.newMetadatas){
      this.entity.newMetadatas.forEach( element => {
        if(element.value && this.isStringAnArrayRegex(element.value.toString()))
          element.value = element.value.toString().replace(/[[\]\r\n"']/g,'').replace(/,/g, ', ').replace(/\s+/g, ' ').trim()
      });
      this.entity.oldMetadadatas.forEach( element => {
        if(element.value && this.isStringAnArrayRegex(element.value))
          element.value = element.value.toString().replace(/[[\]\r\n"']/g,'').replace(/,/g, ', ').replace(/\s+/g, ' ').trim()
      });
    }
    if(this.entity.metadatasAdic){
      this.entity.metadatasAdic.forEach( element => {
        if(element.value && this.isStringAnArrayRegex(element.value.toString()))
          element.value = element.value.toString().replace(/[[\]\r\n"']/g,'').replace(/,/g, ', ').replace(/\s+/g, ' ').trim()
      });
    }
  }

  private isStringAnArrayRegex(str: string): boolean {
    return /^\s*\[\s*(?:\w+|".*?"|'.*?')(?:\s*,\s*(?:\w+|".*?"|'.*?'))*\s*\]\s*$/.test(str);
  }

  ngOnInit(): void {
  }
}
