import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
    selector: 'app-claim-entry',
    standalone: true,
    imports: [
        NzBreadCrumbModule,
        CommonModule,
        NzCardModule,
        NzGridModule,
        NzDividerModule,
        NzModalModule,
        NzIconModule,
        NzButtonComponent,
        NzDatePickerModule
    ],
    templateUrl: './claim-entry.component.html',
    styleUrls: ['./claim-entry.component.css']
})
export class ClaimEntryComponent {
    inputs = [
        { label: '1st' },
        { label: '2nd' },
        { label: '3rd' },
        { label: '4th' },
        { label: '5th' },
        { label: '6th' },
        { label: '7th' },
        { label: '8th' },
        { label: '9th' },
        { label: '10th' },
        { label: '11th' },
        { label: '12th' },
    ];
    rows = Array.from({ length: 3 });

    constructor() {
    }

    ngOnInit(): void {

    }
}