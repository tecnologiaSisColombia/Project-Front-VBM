import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-insurers-covers',
    standalone: true,
    imports: [
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzSelectModule,
        NzCardModule,
        CommonModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './insurers-covers.component.html',
    styleUrl: './insurers-covers.component.css'
})

export class InsurersCoversComponent { }
