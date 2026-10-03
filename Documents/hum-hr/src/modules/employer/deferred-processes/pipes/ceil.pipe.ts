import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ceil'
})
export class CeilPipe implements PipeTransform {

  transform(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return Number.isNaN(num) ? 0 : Math.ceil(num);
  }

}
