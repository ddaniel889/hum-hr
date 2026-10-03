import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'fileSize'})
export class FileSizePipe implements PipeTransform {

    private units = ['bytes', 'KB', 'MB', 'GB'];

    transform(bytes: number): string {

        if (!isFinite(bytes)) {
            return '';
        }

        let unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit ++;
        }

        return bytes.toFixed(2) + ' ' + this.units[unit];
    }
}
