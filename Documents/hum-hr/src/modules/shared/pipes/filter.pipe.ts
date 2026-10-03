import { Pipe, PipeTransform } from '@angular/core';
import { FileDocument } from '../models/file-document.model';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {

    transform(metadata: string, value: string): string {
        if (typeof value !== 'undefined' && value) {
            switch (metadata) {
                case FileDocument.periodSystemName:
                        value = [value.slice(0, 4), '/', value.slice(4)].join('');
                    break;
                case FileDocument.dateSystemName:
                    const datePipe = new DatePipe("en-US");
                    value = datePipe.transform(value, 'dd/MM/yyyy');
                    break;
                default:
                    break;
            }

            return value;
        }

    }
}
