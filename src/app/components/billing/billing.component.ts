import { Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
    selector: 'app-billing',
    imports: [
        NzBreadCrumbModule,
        NzIconModule,
        NzInputModule,
        NzPaginationModule,
        NzSpinModule,
        NzSwitchModule,
        NzTableModule
    ],
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.css', '/src/animations/styles.css']
})
export class BillingComponent {


  constructor() {

  }

  ngOnInit(): void {

  }
}
