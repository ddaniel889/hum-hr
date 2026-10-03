import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ComboKv' })
export class ComboKvPipe implements PipeTransform {
    transform(value: string, optionvalues: any[]): string {
        if (typeof value !== 'undefined' && value) {
            let returnValue = '';
            let options = [];
            if (!Array.isArray(optionvalues)) {
                options = JSON.parse(optionvalues);
            } else {
                options = optionvalues;
            }

            if (!Array.isArray(value)) {
                return this.getValue(value, options);
            } else {
                value.forEach(v => {
                    if (returnValue.length > 0) {
                        returnValue = returnValue + ',' + this.getValue(v, options);
                    } else {
                        returnValue = this.getValue(v, options);
                    }
                });
            }

            return returnValue;
        }

        return "";
    }

    private getValue(value: string, optionvalues: any[]): string {
        const opt = optionvalues.filter(o => o.value === value);
        if (opt.length < 1)  {
            return value;
        } else {
            return opt[0].description;
        }

    }
}
