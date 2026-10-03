import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Pipe({name: 'msjDescriptionPipe'})

export class MsjDescriptionPipe implements PipeTransform {
    private data: any;

    constructor( private http: HttpClient) {
        this.load();
    }

    async load () {
        if (!this.data) {
            const result = await this.http.get('assets/error.json').toPromise();
            this.data = result;
        }
    }

    transform(value: any): string {
        const response = 'Ocurrió un error, intente nuevamente.';
        let responseDescription;

        if (value) {
            responseDescription = value.description;
        }

        try {
            if (!this.data) {
                return response;
            }

            if (value.code || value.description) {
                // Si el error es 'Metadata Nro Legajo is requerid' lo cambio por NroLegajoRequerid
                if (value.code === 'Metadata Nro Legajo is requerid') {
                    value.code = 'NroLegajoRequerid';
                }

                if (value.code && value.code.startsWith('Metadata ') && value.code.endsWith('is required') ){
                    value.code = 'MetadataRequerid';
                }

                // tslint:disable-next-line:no-eval
                var code = value.code;
                if (value.code){
                    code = value.code.replaceAll(" ", "");
                }
                              
                return eval(`this.data.${code}`)  || eval(`this.data.${value.description}`) || response;
            }

            if (value.message) {
                // tslint:disable-next-line:no-eval
                return eval(`this.data.${value.message}`) || response;
            }

            // tslint:disable-next-line:no-eval
            return eval(`this.data.${value}`) || response;
        } catch (Exception) {      
            return responseDescription || response;
        }
    }
}
