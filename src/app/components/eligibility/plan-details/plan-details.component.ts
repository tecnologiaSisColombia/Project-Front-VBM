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
    @Input() patientName: string = '';
    @Input() primaryPlanName: string = '';

    @ViewChild('childContent', { static: false }) childContent!: ElementRef;
    currentTime: string = '';

    constructor() {
    }

    ngOnInit(): void {
        this.updateCurrentTime();
    }

    getChildContent(): ElementRef {
        return this.childContent;
    }

    updateCurrentTime() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours() % 12 || 12;
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

        this.currentTime = `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
    }
}