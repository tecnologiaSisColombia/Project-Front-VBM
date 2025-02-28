import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-claim-form-pdf',
  standalone: true,
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './claim-form-pdf.component.html',
  styleUrls: ['./claim-form-pdf.component.css']
})
export class ClaimFormPdfComponent {
  @Input() showPdf: boolean = false;
  @Input() claimDataView: any;
  @Output() closePdf: EventEmitter<void> = new EventEmitter<void>();

  pdfSrc: string = '';

  constructor() { }

  closeViewer(): void {
    this.closePdf.emit();
  }


  async fillPdf(): Promise<void> {
    const existingPdfBytes = await fetch('assets/form-cms1500.pdf').then(res => res.arrayBuffer());

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    console.log("Campos disponibles en el PDF:");
    console.log(form.getFields().map(f => f.getName()));

    const lastName = this.claimDataView?.patient_data?.last_name;
    const firstName = this.claimDataView?.patient_data?.first_name;
    const middleInitial = this.claimDataView?.patient_data?.middle_initial;
    const fullName = `${lastName}, ${firstName} ${middleInitial}`.trim();

    const birthDate = this.claimDataView?.patient_data?.birth_date;

    if (birthDate && /^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      const [year, month, day] = birthDate.split('-');
      form.getTextField('birth_mm')?.setText(month);
      form.getTextField('birth_dd')?.setText(day);
      form.getTextField('birth_yy')?.setText(year.slice(-2));
    }

    const dateOnly = this.claimDataView?.date_service.split("T")[0];


    form.getTextField('tax_id')?.setText(this.claimDataView?.federal_tax_id);
    form.getTextField('pt_name')?.setText(fullName);
    form.getTextField('insurance_id')?.setText(this.claimDataView?.patient_data?.primary_subscriber_id);
    form.getTextField('pt_street')?.setText(this.claimDataView?.patient_data?.primary_address);
    form.getTextField('pt_city')?.setText(this.claimDataView?.patient_data?.city);
    form.getTextField('pt_state')?.setText(this.claimDataView?.patient_data?.state);

    form.getTextField('pt_zip')?.setText(this.claimDataView?.patient_data?.postal_code);
    form.getTextField('pt_phone')?.setText(this.claimDataView?.patient_data?.primary_phone);
    form.getTextField('ins_policy')?.setText(this.claimDataView?.patient_data?.primary_group_number);
    form.getTextField('pt_date')?.setText(dateOnly);

    
    
    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const newPdfSrc = URL.createObjectURL(blob);

    this.pdfSrc = newPdfSrc;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claimDataView'] && this.claimDataView) {
      console.log(this.claimDataView)
      this.fillPdf();
    }
  }

  ngOnInit(): void {
    // Puedes iniciar algo si es necesario
  }
}
