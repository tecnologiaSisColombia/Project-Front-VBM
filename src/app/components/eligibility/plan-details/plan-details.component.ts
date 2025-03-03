import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { Input } from '@angular/core';

@Component({
    selector: 'app-plan-details',
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
    @Input() claimData: any;

    @ViewChild('childContent', { static: false }) childContent!: ElementRef;
    currentTime: string = '';

    constructor() { }

    ngOnInit(): void {
        this.updateCurrentTime();
    }

    getChildContent(): ElementRef {
        return this.childContent;
    }

    updateCurrentTime() {
        const now = new Date();
        this.currentTime = now.toLocaleString('en-US', { hour12: true });
    }

}