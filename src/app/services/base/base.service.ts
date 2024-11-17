import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class BaseService {
    constructor(protected http: HttpClient) { }

    handleRequest(
        request: Observable<any>,
        component: {
            showMessage: (message: string, type: 'error' | 'success') => void;
            isLoading: boolean;
        },
        successCallback: () => void = () => { }
    ): void {
        component.isLoading = true;

        request.subscribe({
            next: (response: any) => {
                component.showMessage(response.message, 'success');
                successCallback();
                component.isLoading = false;
            },
            error: (error: HttpErrorResponse) => {
                const message = error?.error?.error?.message || 'Unexpected error occurred';
                component.showMessage(message, 'error');
                component.isLoading = false;
            }
        });
    }
}
