import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PDFName, PDFDocument, PDFCheckBox } from 'pdf-lib';

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

    // console.log(form.getFields().map(f => f.getName()));

    const patientData = this.claimDataView?.patient_data;

    const { last_name: lastName, first_name: firstName, middle_initial: middleInitial } = patientData;

    const fullName = [lastName, firstName, middleInitial].filter(Boolean).join(", ").replace(", ", " ");

    form.getTextField('pt_name')?.setText(fullName);

    const birthDate = patientData?.birth_date;

    if (birthDate?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = birthDate.split('-');

      const fields = {
        birth_mm: month,
        birth_dd: day,
        birth_yy: year.slice(-2),
      };

      Object.entries(fields).forEach(([key, value]) => {
        form.getTextField(key)?.setText(value);
      });
    }

    const sexValue = PDFName.of(patientData.gender === "F" ? "F" : "M");

    form.getField("sex")?.acroField.dict.set(PDFName.of("V"), sexValue);

    const dateOnly = this.claimDataView?.date_service.split("T")[0];

    form.getTextField('pt_date')?.setText(dateOnly);

    form.getTextField('insurance_id')?.setText(patientData?.primary_subscriber_id);

    form.getTextField('pt_street')?.setText(patientData?.primary_address);

    form.getTextField('pt_city')?.setText(patientData?.city);

    form.getTextField('pt_state')?.setText(patientData?.state);

    form.getTextField('pt_zip')?.setText(patientData?.postal_code);

    form.getTextField('pt_phone')?.setText(patientData?.primary_phone);

    form.getTextField('ins_policy')?.setText(patientData?.primary_group_number);

    form.getTextField('tax_id')?.setText(this.claimDataView?.federal_tax_id);

    const relationshipMap: Record<number, string> = {
      1: "S",
      2: "M",
      3: "C",
      4: "O",
    };

    const selectedValue = relationshipMap[this.claimDataView?.relationship];

    form.getField("rel_to_ins")?.acroField.dict.set(PDFName.of("V"), PDFName.of(selectedValue));

    const insuredDateBirth = this.claimDataView?.insured_date_birth

    if (insuredDateBirth?.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}([-+]\d{2}:\d{2})?)?$/)) {
      const [datePart] = insuredDateBirth.split("T");
      const [year, month, day] = datePart.split("-");

      const fields = {
        ins_dob_mm: month,
        ins_dob_dd: day,
        ins_dob_yy: year.slice(-2),
      };

      Object.entries(fields).forEach(([key, value]) => {
        form.getTextField(key)?.setText(value);
      });
    }

    form.getTextField('ins_plan_name')?.setText(patientData?.primary_insure_plan_name);

    const field = form.getField("ins_sex");

    if (field instanceof PDFCheckBox) {
      const value = patientData.gender === "F" ? PDFName.of("FEMALE") : PDFName.of("MALE");
      field.acroField.dict.set(PDFName.of("V"), value);
    }

    form.flatten();

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const newPdfSrc = URL.createObjectURL(blob);

    this.pdfSrc = newPdfSrc;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claimDataView'] && this.claimDataView) {
      // console.log(this.claimDataView)
      this.fillPdf();
    }
  }

  ngOnInit(): void {
    // Puedes iniciar algo si es necesario
  }
}
