import { NgModule } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@NgModule({
    declarations: [],
    imports: [
        NzBreadCrumbModule,
        NzButtonModule,
        NzDividerModule,
        NzDrawerModule,
        NzFormModule,
        NzIconModule,
        NzInputModule,
        NzSpinModule,
        NzTableModule,
        NzMessageModule,
        NzSwitchModule,
        NzPaginationModule,
        NzSelectModule,
        NzEmptyModule
    ],
    exports: [
        NzBreadCrumbModule,
        NzButtonModule,
        NzDividerModule,
        NzDrawerModule,
        NzFormModule,
        NzIconModule,
        NzInputModule,
        NzSpinModule,
        NzTableModule,
        NzMessageModule,
        NzSwitchModule,
        NzPaginationModule,
        NzSelectModule,
        NzEmptyModule
    ]
})
export class NgZorroModule { }
