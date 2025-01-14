import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-plan-details',
    standalone: true,
    imports: [
        NzBreadCrumbModule,
        CommonModule,
        NzCardModule,
        NzGridModule,
        NzDividerModule,
        NzModalModule
    ],
    templateUrl: './plan-details.component.html',
    styleUrls: ['./plan-details.component.css']
})
export class PlanDetailsComponent {
    @ViewChild('childContent', { static: false }) childContent!: ElementRef;

    constructor() {
    }

    ngOnInit(): void {

    }

    getChildContent(): ElementRef {
        return this.childContent;
    }
}