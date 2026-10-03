import { MsjDescriptionPipe } from './msj-description.pipe';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, getTestBed } from "@angular/core/testing";

describe('msj-descriptin-pipe', () => {
    let injector: TestBed;
    let pipe: MsjDescriptionPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule
              ],
            providers: [
                MsjDescriptionPipe,
                HttpClient
            ]
          });

        injector = getTestBed();
        pipe = new MsjDescriptionPipe( injector.get(HttpClient));
    });

    it('should describe error locked_out, El usuario fue bloqueado, comunícate con el área de RRHH.', async () => {
        await pipe.load();
        const response = await pipe.transform( { code : 'locked_out'});
        expect(response).toBe('El usuario fue bloqueado, comunícate con el área de RRHH.');
    });

    it('should describe error invalido, Ocurrió un error, intente nuevamente.', async () => {
        await pipe.load();
        const response = await pipe.transform( { });
        expect(response).toBe('Ocurrió un error, intente nuevamente.');
    });

    it('should describe Error Invalido, Ocurrió un error, intente nuevamente.', async () => {
        await pipe.load();
        const response = await pipe.transform( { code: 'Error Invalido' });
        expect(response).toBe('Ocurrió un error, intente nuevamente.');
    });
});
