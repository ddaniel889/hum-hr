import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Pipe({ name: 'auditTranslate' })

export class AuditTranslatePipe implements PipeTransform {
    private data: any;

    constructor(private http: HttpClient) {
    }

    async load() {
        if (!this.data) {
            const result = await this.http.get('assets/audit-translate.json').toPromise();
            this.data = result;
        }
    }

    async transform(value: any): Promise<string> {
        if (!this.data) {
            await this.load();
        }

        let returnText = this.data[value];
        if (!returnText) {
            returnText = value;
        }

        return returnText;
    }
}
