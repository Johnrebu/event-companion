import { useState } from "react";
import "./FeedbackFormPage.css";

type FormState = Record<string, string>;
const WHATSAPP_NUMBER = "919150043968";

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  age: "Age",
  profession: "Profession",
  mobile: "Mobile Number",
  income: "Monthly Income (approx)",
  alignedGoals: "Investments aligned with goals",
  topGoals: "Top 3 Financial Goals",
  retirementAge: "Expected Retirement Age",
  retirementIncome: "Expected Retirement Income (monthly)",
  childrenFundsSecured: "Children education/marriage funds secured",
  child1EducationAmount: "Child 1 Education Amount",
  child1EducationYears: "Child 1 Education in Years",
  child1MarriageAmount: "Child 1 Marriage Amount",
  child1MarriageYears: "Child 1 Marriage in Years",
  child2EducationAmount: "Child 2 Education Amount",
  child2EducationYears: "Child 2 Education in Years",
  child2MarriageAmount: "Child 2 Marriage Amount",
  child2MarriageYears: "Child 2 Marriage in Years",
  child3EducationAmount: "Child 3 Education Amount",
  child3EducationYears: "Child 3 Education in Years",
  child3MarriageAmount: "Child 3 Marriage Amount",
  child3MarriageYears: "Child 3 Marriage in Years",
  mutualFunds: "Mutual Funds",
  stocks: "Direct Equity",
  bonds: "Bonds / Debt",
  fd: "Fixed Deposits",
  gold: "Physical Gold (grams)",
  savings: "Savings Balance",
  goldStoredAt: "Gold Stored At",
  purposeOfAttending: "Purpose of Attending",
  anythingElse: "Anything Else",
  healthInsurance: "Health Insurance",
  healthInsuranceCompany: "Health Insurance Company",
  healthInsurancePolicyType: "Health Policy Type",
  healthInsuranceExpiry: "Health Policy Expiry",
  healthInsuranceFromMoneyPechu: "Health Policy from Money Pechu",
  familyHealthInsuranceApartFromCompany: "Family Health Insurance (apart from company)",
  familyMember1Name: "Family Member Name",
  familyMember1Dob: "Family Member DOB",
  familyMember1Relationship: "Family Member Relationship",
  familyMember1Pincode: "Family Member Pincode",
  termInsurance: "Term Insurance",
  termInsuranceFromMoneyPechu: "Term Policy from Money Pechu",
  groupInsurance: "Group Medical Insurance",
  companyName: "Company Name",
  companyLocation: "Company Location",
  groupCoverage: "Group Coverage",
  vehicleType: "Vehicle Type",
  vehicleNumber: "Vehicle Number",
  vehicleModel: "Vehicle Model",
  policyExpiry: "Vehicle Policy Expiry",
  callDate: "Preferred Call Date",
  timeSlot: "Preferred Time Slot",
  refName: "Referral Name",
  refMobile: "Referral Contact Number",
  refRelation: "Referral Relationship",
  refLocation: "Referral Location",
};

const FORM_ORDER = Object.keys(FIELD_LABELS);

const escapePdfText = (input: string) =>
  input
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");

const wrapText = (text: string, maxChars = 92) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
};

const createPdfBlob = (lines: string[]) => {
  const pageHeight = 842;
  const marginTop = 800;
  const lineHeight = 14;
  const maxLinesPerPage = Math.floor((pageHeight - 80) / lineHeight);
  const pages: string[][] = [];
  let currentPage: string[] = [];

  for (const line of lines) {
    const wrapped = wrapText(line);
    for (const wrappedLine of wrapped) {
      if (currentPage.length >= maxLinesPerPage) {
        pages.push(currentPage);
        currentPage = [];
      }
      currentPage.push(wrappedLine);
    }
  }
  if (currentPage.length > 0) pages.push(currentPage);

  const objects: Record<number, string> = {};
  const fontObjectNumber = 3;
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[fontObjectNumber] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const kids: string[] = [];
  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;

    const content = [
      "BT",
      "/F1 10 Tf",
      `${lineHeight} TL`,
      `40 ${marginTop} Td`,
      ...pageLines.map((line, i) => `${i === 0 ? "" : "T* " }(${escapePdfText(line)}) Tj`),
      "ET",
    ].join("\n");

    objects[contentObjectNumber] =
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageObjectNumber] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    kids.push(`${pageObjectNumber} 0 R`);
  });

  objects[2] = `<< /Type /Pages /Count ${kids.length} /Kids [${kids.join(" ")}] >>`;

  const maxObjectNumber = Math.max(...Object.keys(objects).map(Number));
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = Array(maxObjectNumber + 1).fill(0);

  for (let i = 1; i <= maxObjectNumber; i += 1) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxObjectNumber + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= maxObjectNumber; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectNumber + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
};

const buildFeedbackPdf = (submittedForm: FormState) => {
  const today = new Date().toISOString().slice(0, 10);
  const fileName = `feedback-form-${today}.pdf`;
  const lines: string[] = [
    "MONEY PECHU - Feedback Form Submission",
    `Generated On: ${new Date().toLocaleString()}`,
    "",
  ];

  for (const key of FORM_ORDER) {
    const value = submittedForm[key] ?? "";
    lines.push(`${FIELD_LABELS[key]}: ${value || "-"}`);
  }

  const extraKeys = Object.keys(submittedForm).filter((key) => !FIELD_LABELS[key]);
  if (extraKeys.length > 0) {
    lines.push("", "Additional Fields:");
    for (const key of extraKeys) {
      lines.push(`${key}: ${submittedForm[key]}`);
    }
  }

  const blob = createPdfBlob(lines);
  return { blob, fileName };
};

const downloadFeedbackPdf = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const openWhatsAppChat = (fileName: string) => {
  const text = encodeURIComponent(
    `New feedback form submitted. File: ${fileName}. Please attach/send the downloaded PDF.`,
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
};

const tryNativeShare = async (blob: Blob, fileName: string) => {
  if (!navigator.share || !navigator.canShare) return false;

  const file = new File([blob], fileName, { type: "application/pdf" });
  if (!navigator.canShare({ files: [file] })) return false;

  try {
    await navigator.share({
      title: "Feedback Form PDF",
      text: "Sharing submitted feedback form PDF",
      files: [file],
    });
    return true;
  } catch {
    return false;
  }
};

export default function FeedbackFormPage() {
  const [form, setForm] = useState<FormState>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submittedForm: FormState = {};

    formData.forEach((value, key) => {
      submittedForm[key] = String(value).trim();
    });

    setForm(submittedForm);
    console.log(submittedForm);
    const { blob, fileName } = buildFeedbackPdf(submittedForm);
    downloadFeedbackPdf(blob, fileName);
    await tryNativeShare(blob, fileName);
    openWhatsAppChat(fileName);
    alert("Form submitted. PDF downloaded and WhatsApp chat opened.");
    // Send to backend / CRM API here
  };

  return (
    <div className="financial-form-page">
      <div className="financial-form-container">
        <h1>MONEY PECHU</h1>
        <p className="form-subtitle">Feedback Form - Financial and Insurance Questionnaire</p>

        <form onSubmit={handleSubmit}>
          <h2>Personal Details</h2>

          <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
          <input name="age" placeholder="Age" onChange={handleChange} />
          <input name="profession" placeholder="Profession" onChange={handleChange} />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} />
          <input name="income" placeholder="Monthly Income (approx)" onChange={handleChange} />

          <h2>Financial Goals</h2>

          <label>Are your current investments aligned with specific financial goals?</label>
          <select name="alignedGoals" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <textarea
            name="topGoals"
            placeholder="Top 3 financial goals in order of priority"
            onChange={handleChange}
          />

          <input
            name="retirementAge"
            placeholder="At what age do you expect to retire?"
            onChange={handleChange}
          />

          <input
            name="retirementIncome"
            placeholder="Expected monthly income during retirement (in today's value)"
            onChange={handleChange}
          />

          <label>Are funds for your children's education and marriage secured?</label>
          <select name="childrenFundsSecured" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <h2>Child Education and Marriage Planning</h2>
          <input name="child1EducationAmount" placeholder="Child 1 education amount" onChange={handleChange} />
          <input name="child1EducationYears" placeholder="Child 1 education in years" onChange={handleChange} />
          <input name="child1MarriageAmount" placeholder="Child 1 marriage amount" onChange={handleChange} />
          <input name="child1MarriageYears" placeholder="Child 1 marriage in years" onChange={handleChange} />
          <input name="child2EducationAmount" placeholder="Child 2 education amount" onChange={handleChange} />
          <input name="child2EducationYears" placeholder="Child 2 education in years" onChange={handleChange} />
          <input name="child2MarriageAmount" placeholder="Child 2 marriage amount" onChange={handleChange} />
          <input name="child2MarriageYears" placeholder="Child 2 marriage in years" onChange={handleChange} />
          <input name="child3EducationAmount" placeholder="Child 3 education amount" onChange={handleChange} />
          <input name="child3EducationYears" placeholder="Child 3 education in years" onChange={handleChange} />
          <input name="child3MarriageAmount" placeholder="Child 3 marriage amount" onChange={handleChange} />
          <input name="child3MarriageYears" placeholder="Child 3 marriage in years" onChange={handleChange} />

          <h2>Current Investments</h2>

          <input name="mutualFunds" placeholder="Mutual Funds Value" onChange={handleChange} />
          <input name="stocks" placeholder="Direct Equity Value" onChange={handleChange} />
          <input name="bonds" placeholder="Bonds / Debt Instruments" onChange={handleChange} />
          <input name="fd" placeholder="Fixed Deposits" onChange={handleChange} />
          <input name="gold" placeholder="Gold (grams)" onChange={handleChange} />
          <input name="savings" placeholder="Savings Account Balance" onChange={handleChange} />
          <select name="goldStoredAt" onChange={handleChange}>
            <option>Stored at Home</option>
            <option>Stored at Bank</option>
          </select>

          <h2>Event / Consultation Feedback</h2>
          <textarea
            name="purposeOfAttending"
            placeholder="What was your primary purpose for attending the event or consultation?"
            onChange={handleChange}
          />
          <textarea
            name="anythingElse"
            placeholder="Anything else you would like to mention or discuss?"
            onChange={handleChange}
          />

          <h2>Insurance Details</h2>

          <label>Do you currently have a health insurance policy for yourself?</label>
          <select name="healthInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>
          <input name="healthInsuranceCompany" placeholder="Insurance company name" onChange={handleChange} />
          <input name="healthInsurancePolicyType" placeholder="Policy type (Individual / Floater)" onChange={handleChange} />
          <input name="healthInsuranceExpiry" placeholder="Policy expiry date" onChange={handleChange} />
          <select name="healthInsuranceFromMoneyPechu" onChange={handleChange}>
            <option>Insurance taken from Money Pechu team? No</option>
            <option>Insurance taken from Money Pechu team? Yes</option>
          </select>

          <label>Do you have health insurance for family apart from company group medical?</label>
          <select name="familyHealthInsuranceApartFromCompany" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>
          <input name="familyMember1Name" placeholder="Family member 1 name" onChange={handleChange} />
          <input name="familyMember1Dob" placeholder="Family member 1 date of birth" onChange={handleChange} />
          <input name="familyMember1Relationship" placeholder="Family member 1 relationship" onChange={handleChange} />
          <input name="familyMember1Pincode" placeholder="Family member 1 pin code" onChange={handleChange} />

          <label>Do you have a term insurance policy (pure risk cover)?</label>
          <select name="termInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>
          <select name="termInsuranceFromMoneyPechu" onChange={handleChange}>
            <option>Term insurance taken from Money Pechu team? No</option>
            <option>Term insurance taken from Money Pechu team? Yes</option>
          </select>

          <label>Group medical insurance provided by your company?</label>
          <select name="groupInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>
          <input name="companyName" placeholder="Company name" onChange={handleChange} />
          <input name="companyLocation" placeholder="Company location" onChange={handleChange} />
          <select name="groupCoverage" onChange={handleChange}>
            <option>Coverage: Only Self</option>
            <option>Coverage: Self + Family</option>
          </select>

          <h2>Vehicle Details</h2>

          <select name="vehicleType" onChange={handleChange}>
            <option>None</option>
            <option>Car</option>
            <option>Bike</option>
            <option>Both</option>
          </select>

          <input name="vehicleNumber" placeholder="Vehicle Number" onChange={handleChange} />
          <input name="vehicleModel" placeholder="Brand &amp; Model" onChange={handleChange} />
          <input name="policyExpiry" placeholder="Policy Expiry Date" onChange={handleChange} />

          <h2>Preferred Call Time</h2>

          <input type="date" name="callDate" onChange={handleChange} />

          <select name="timeSlot" onChange={handleChange}>
            <option>9 AM - 12 PM</option>
            <option>12 PM - 3 PM</option>
            <option>3 PM - 6 PM</option>
          </select>

          <h2>Referral</h2>

          <input name="refName" placeholder="Friend Name" onChange={handleChange} />
          <input name="refMobile" placeholder="Friend Contact Number" onChange={handleChange} />
          <input name="refRelation" placeholder="Relationship" onChange={handleChange} />
          <input name="refLocation" placeholder="Location" onChange={handleChange} />

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
