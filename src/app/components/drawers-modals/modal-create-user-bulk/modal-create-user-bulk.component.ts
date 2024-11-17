import { Component } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'nz-demo-modal-basic',
  standalone: true,
  imports: [NzButtonModule, NzModalModule, NzIconModule, CommonModule, FormsModule],
  template: `
    <button nz-button [nzType]="'primary'" (click)="showModal()">
      <i nz-icon nzType="usergroup-add"></i>
      <span>Create Users Bulk</span>
    </button>
    <nz-modal
      [(nzVisible)]="isVisible"
      nzTitle="Create Users Bulk"
      (nzOnCancel)="handleCancel()"
      (nzOnOk)="handleOk()"
      nzOkText="Create Users">
      <ng-container *nzModalContent>
        <form>
          <p>Please upload your file:</p>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <label for="fileInput" style="cursor: pointer; background: #f0f0f0; padding: 6px 44px; border: 1px solid #d9d9d9; border-radius: 4px;">
              Select File
            </label>
            <input
              id="fileInput"
              type="file"
              (change)="onFileSelected($event)"
              style="display: none;"
            />
            <span>{{ selectedFile?.name || 'No file selected' }}</span>
          </div>
          <a 
            href="assets/structure.csv" 
            download 
            style="text-decoration: none;"
            onmouseover="this.style.textDecoration='underline';"
            onmouseout="this.style.textDecoration='none';"
            >
            Download structure to upload
        </a>
        </form>
      </ng-container>
    </nz-modal>
  `
})

export class NzDemoModalBasicComponent {
  isVisible = false;
  selectedFile: File | null = null;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    if (this.selectedFile) {
      console.log('File uploaded:', this.selectedFile);
    }
    // this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }
}
