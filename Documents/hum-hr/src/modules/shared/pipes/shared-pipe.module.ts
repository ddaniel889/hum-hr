import { ModuleWithProviders, NgModule } from '@angular/core';
import { ComboKvPipe } from './comboKv.pipe';
import { AuditTranslatePipe } from './audit-translate.pipe';

@NgModule({
    imports: [],
    declarations: [ComboKvPipe, AuditTranslatePipe],
    exports: [ComboKvPipe, AuditTranslatePipe]
})

export class SharedPipeModule {

    static forRoot(): ModuleWithProviders<SharedPipeModule> {
    return {
        ngModule: SharedPipeModule,
        providers: [],
    };
}
}
