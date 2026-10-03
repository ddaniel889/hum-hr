import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cuil'})
export class CuilPipe implements PipeTransform {
    transform(value: string): string {
if (typeof value !== 'undefined' && value ) {
        value = [value.slice(0, 2), '-', value.slice(2)].join('');
        value =  [value.slice(0, 11), '-', value.slice(11)].join('');
        return value;
    }
    return "No declarado";

    }
}
