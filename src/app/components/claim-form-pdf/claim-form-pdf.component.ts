import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PDFName, PDFDocument, PDFCheckBox, PDFArray, PDFDict } from 'pdf-lib';
import { ModifiersService } from 'app/services/config/modifiers.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-claim-form-pdf',
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
  modifiersOptions: { label: string; value: number }[] = [];
  modifiersInput: any[] = [];

  constructor(
    private msgService: NzMessageService,
    private modifiersService: ModifiersService,
  ) { }

  ngOnInit(): void {
    this.getModifiers();
  }

  async fillPdf(): Promise<void> {
    const existingPdfBytes = await fetch('assets/form-cms1500.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const form = pdfDoc.getForm();

    console.log(form.getFields().map(f => f.getName()));

    const patientData = this.claimDataView?.patient_data;

    const providerData = this.claimDataView?.provider_data;

    const dxData = this.claimDataView?.dx;

    const cptsData = this.claimDataView?.cpts;

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

    const assignmentValue = PDFName.of(this.claimDataView?.accept_assignment === 1 ? "YES" : "NO");

    form.getField("assignment")?.acroField.dict.set(PDFName.of("V"), assignmentValue);

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

    form.getTextField('pin1')?.setText(this.claimDataView?.service_facility_npi);

    form.getTextField('fac_street')?.setText(this.claimDataView?.service_facility_location);

    form.getTextField('doc_phone')?.setText(providerData?.user?.phone);

    form.getTextField('pin')?.setText(providerData?.npi);

    form.getTextField('doc_street')?.setText(providerData?.address);

    form.getTextField('t_charge')?.setText(String(this.claimDataView?.total_charge));

    form.getTextField('amt_paid')?.setText(String(this.claimDataView?.amount_paid ?? '0.00'));

    form.getTextField('pt_account')?.setText(String(this.claimDataView?.patient_account_number ?? ''));

    form.getTextField('prior_auth')?.setText(String(this.claimDataView?.prior_authorization_number ?? ''));

    form.getTextField('ref_physician')?.setText(String(this.claimDataView?.name_referring_provider ?? ''));

    form.getTextField('id_physician')?.setText(String(this.claimDataView?.name_referring_provider_npi ?? ''));

    form.getTextField('physician_date')?.setText(
      String(this.claimDataView?.date_signature_doctor?.split('T')[0] ?? '')
    );

    const relationshipMap: Record<number, string> = {
      1: "S",
      2: "M",
      3: "C",
      4: "O",
    };

    const valueRelationship = relationshipMap[this.claimDataView?.relationship];

    form.getField("rel_to_ins")?.acroField.dict.set(PDFName.of("V"), PDFName.of(valueRelationship));

    const signatureMap: Record<number, string> = {
      1: "SOF (Signature On File)",
    };

    const patientSignature = signatureMap[this.claimDataView?.patient_signature];

    const insuredSignature = signatureMap[this.claimDataView?.insured_signature];

    const doctorSignature = signatureMap[this.claimDataView?.signature_doctor];

    form.getTextField('pt_signature')?.setText(patientSignature);

    form.getTextField('ins_signature')?.setText(insuredSignature);

    form.getTextField('physician_signature')?.setText(doctorSignature);

    const dateInsured = this.extractDateParts(String(this.claimDataView?.insured_date_birth));

    const fields = {
      ins_dob_mm: dateInsured.mm,
      ins_dob_dd: dateInsured.dd,
      ins_dob_yy: dateInsured.yy,
    };

    Object.entries(fields).forEach(([key, value]) => {
      form.getTextField(key)?.setText(value);
    });

    form.getTextField('ins_plan_name')?.setText(patientData?.primary_insure_plan_name);

    const field = form.getField("ins_sex");

    if (field instanceof PDFCheckBox) {
      const value = patientData.gender === "F" ? PDFName.of("FEMALE") : PDFName.of("MALE");
      field.acroField.dict.set(PDFName.of("V"), value);
    }

    const ssnEin: Record<number, string> = {
      1: "SSN",
      2: "EIN",
    };

    const valueSsnEin = ssnEin[this.claimDataView?.ssn_ein];

    form.getField("ssn")?.acroField.dict.set(PDFName.of("V"), PDFName.of(valueSsnEin));

    dxData.forEach((item: any, index: number) => {
      const fieldNameDiag = `diagnosis${index + 1}`;
      form.getTextField(fieldNameDiag)?.setText(item.dx);
    });

    const diagPointerMap: Record<number, string> = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i + 1, String.fromCharCode(65 + i)])
    );

    cptsData.forEach((item: any, index: number) => {
      const dateInitial = this.extractDateParts(String(item.date_initial));

      const dateFinal = this.extractDateParts(String(item.date_final));

      const fields = {
        [`place${index + 1}`]: String(item.place_of_service),
        [`type${index + 1}`]: item.emg === 1 ? "YES" : "NO",
        [`cpt${index + 1}`]: item.service ?? item.product,
        [`ch${index + 1}`]: item.charges,
        [`day${index + 1}`]: item.days_or_unit,
        [`local${index + 1}`]: item.rendering_provider_id,
        [`diag${index + 1}`]: diagPointerMap[item.diagnosis_pointer],
        [`mod${index + 1}`]: this.getModifierCodeById((item.modifier_1)),
        [`mod${index + 1}a`]: this.getModifierCodeById((item.modifier_2)),
        [`mod${index + 1}b`]: this.getModifierCodeById((item.modifier_3)),
        [`mod${index + 1}c`]: this.getModifierCodeById((item.modifier_4)),
        [`sv${index + 1}_mm_from`]: dateInitial.mm,
        [`sv${index + 1}_dd_from`]: dateInitial.dd,
        [`sv${index + 1}_yy_from`]: dateInitial.yy,
        [`sv${index + 1}_mm_end`]: dateFinal.mm,
        [`sv${index + 1}_dd_end`]: dateFinal.dd,
        [`sv${index + 1}_yy_end`]: dateFinal.yy,
      };

      Object.entries(fields).forEach(([fieldName, value]) => {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(value);
        }
      });
    });

    const insuranceTypesMap: Record<number, string> = {
      1: "Medicare",
      2: "Medicaid",
      3: "Tricare",
      4: "Champva",
      5: "Group",
      6: "Feca",
      7: "Other",
    };

    const targetValue = insuranceTypesMap[this.claimDataView?.insurance_type];

    const insuranceType = form.getField('insurance_type');

    const parent = insuranceType.acroField.dict;

    parent.set(PDFName.of('V'), PDFName.of(targetValue));

    const kidsRef = parent.get(PDFName.of('Kids'));

    if (!kidsRef) return;

    const kids = insuranceType.doc.context.lookup(kidsRef) as PDFArray;

    if (!(kids instanceof PDFArray)) return;

    kids.asArray().forEach(ref => {
      const child = insuranceType.doc.context.lookup(ref) as PDFDict;
      if (!(child instanceof PDFDict)) return;
      const nDict = (child.get(PDFName.of('AP')) as PDFDict)?.get(PDFName.of('N'));
      if (!(nDict instanceof PDFDict)) return;
      child.set(PDFName.of('AS'), nDict.has(PDFName.of(targetValue))
        ? PDFName.of(targetValue)
        : PDFName.of('Off')
      );
    });

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

  getModifiers(): void {
    this.modifiersService.get({}, null, null, true).subscribe({
      next: (res: any) => {
        this.modifiersInput = res;
      },
      error: (err) => {
        this.msgService.error(JSON.stringify(err.error));
      },
    });
  }

  getModifierCodeById(id: number): string | undefined {
    const modifier = this.modifiersInput.find((mod) => mod.id === id);
    return modifier ? modifier.code : undefined;
  }

  extractDateParts = (dateStr: string) => {
    const [yy, mm, dd] = dateStr.split('T')[0].split('-');
    return { mm, dd, yy: yy.slice(2) };
  };

  closeViewer(): void {
    this.closePdf.emit();
  }

}
