import { ExpenseItem, EventDetails } from "@/types/expense";
import { EXPENSE_WORKFLOW_STEPS, type ExpenseCompany } from "./expenseCompanies";

export interface BuildExpensePrintHtmlArgs {
  company: ExpenseCompany;
  eventDetails: EventDetails;
  items: ExpenseItem[];
  gstPercentage: number;
}

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export const buildExpensePrintHtml = ({
  company,
  eventDetails,
  items,
  gstPercentage,
}: BuildExpensePrintHtmlArgs) => {
  const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
  const netBalance = totalIncome - totalExpenses;
  const gstAmount = (totalExpenses * gstPercentage) / 100;
  const grandTotal = totalExpenses + gstAmount;

  const workflowCards = EXPENSE_WORKFLOW_STEPS.map(
    (step) => `
      <div class="workflow-card">
        <span>${escapeHtml(step.label)}</span>
        <strong>${escapeHtml(step.value)}</strong>
      </div>
    `,
  ).join("");

  const tableRows = items
    .map(
      (item, index) => `
        <tr${index % 2 === 1 ? ' class="row-alt"' : ""}>
          <td class="center">${item.sNo}</td>
          <td>${escapeHtml(item.particulars || "-")}</td>
          <td class="right income">${item.income > 0 ? escapeHtml(formatCurrency(item.income)) : "-"}</td>
          <td class="right expense">${item.expenses > 0 ? escapeHtml(formatCurrency(item.expenses)) : "-"}</td>
          <td>${escapeHtml(item.billFileName || "-")}</td>
          <td>${escapeHtml(item.remarks || "-")}</td>
        </tr>
      `,
    )
    .join("");

  const generatedOn = escapeHtml(new Date().toLocaleString("en-IN"));
  const totalExpensesFormatted = escapeHtml(formatCurrency(totalExpenses));
  const totalIncomeFormatted = escapeHtml(formatCurrency(totalIncome));
  const gstAmountFormatted = escapeHtml(formatCurrency(gstAmount));
  const grandTotalFormatted = escapeHtml(formatCurrency(grandTotal));
  const netBalanceFormatted = escapeHtml(formatCurrency(netBalance));

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(company.displayName)} Expense Report</title>
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 24px;
          background: #eef2f7;
          color: #0f172a;
          font-family: "Segoe UI", Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .sheet {
          max-width: 860px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #dbe3ef;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 4px solid ${company.printAccentColor};
          background: linear-gradient(180deg, #ffffff 0%, ${company.printAccentSoftColor} 100%);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }
        .brand img {
          height: 58px;
          width: auto;
          flex-shrink: 0;
        }
        .eyebrow {
          margin: 0 0 6px;
          color: ${company.printAccentColor};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .title {
          margin: 0;
          font-size: 28px;
          line-height: 1.05;
          font-weight: 800;
        }
        .subtitle {
          margin: 8px 0 0;
          color: #475569;
          font-size: 13px;
          line-height: 1.6;
        }
        .header-meta {
          min-width: 220px;
          text-align: right;
          font-size: 13px;
          color: #475569;
          line-height: 1.7;
        }
        .header-meta strong {
          color: #0f172a;
        }
        .workflow {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          padding: 18px 28px 0;
        }
        .workflow-card {
          padding: 14px 16px;
          border: 1px solid ${company.printBorderColor};
          border-radius: 14px;
          background: ${company.printAccentSoftColor};
        }
        .workflow-card span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .workflow-card strong {
          font-size: 14px;
          color: #0f172a;
        }
        .section {
          padding: 22px 28px;
        }
        .section + .section {
          border-top: 1px solid #e2e8f0;
        }
        .section-title {
          margin: 0 0 14px;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px 14px;
        }
        .detail-card {
          padding: 12px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
        }
        .detail-card span {
          display: block;
          margin-bottom: 6px;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .detail-card strong {
          font-size: 14px;
          color: #0f172a;
          word-break: break-word;
        }
        .table-shell {
          overflow: hidden;
          border: 1px solid #dbe3ef;
          border-radius: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        thead th {
          padding: 12px 10px;
          background: #0f172a;
          color: #ffffff;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        tbody td {
          padding: 12px 10px;
          border-top: 1px solid #e2e8f0;
          vertical-align: top;
          line-height: 1.5;
        }
        tbody tr.row-alt {
          background: #f8fafc;
        }
        .center {
          text-align: center;
        }
        .right {
          text-align: right;
          white-space: nowrap;
        }
        .income {
          font-weight: 700;
          color: #15803d;
        }
        .expense {
          font-weight: 700;
          color: #b91c1c;
        }
        .summary-row-wrap {
          display: flex;
          justify-content: flex-end;
        }
        .summary-card {
          width: 340px;
          padding: 18px 20px;
          border: 1px solid #dbe3ef;
          border-radius: 16px;
          background: #f8fafc;
        }
        .summary-card h3 {
          margin: 0 0 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dbe3ef;
          font-size: 18px;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .summary-line span:first-child {
          color: #64748b;
        }
        .summary-line strong {
          color: #0f172a;
        }
        .summary-line.total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid ${company.printAccentColor};
          font-size: 16px;
          font-weight: 800;
        }
        .summary-line.total strong {
          color: ${company.printAccentColor};
        }
        .summary-note {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          background: ${company.printAccentSoftColor};
          color: #334155;
          font-size: 13px;
          line-height: 1.6;
        }
        .notes {
          margin: 0;
          padding-left: 20px;
          color: #475569;
          line-height: 1.75;
          font-size: 13px;
        }
        .signatures {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
          margin-top: 36px;
        }
        .signature {
          padding-top: 34px;
          border-top: 1px solid #94a3b8;
          text-align: center;
          color: #475569;
          font-size: 13px;
          line-height: 1.4;
        }
        .signature strong {
          display: block;
          margin-top: 4px;
          color: #0f172a;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 18px 28px 24px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
        }
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            padding: 0;
            background: #ffffff;
          }
          .sheet {
            border: none;
            box-shadow: none;
          }
          thead {
            display: table-header-group;
          }
          tr, .detail-card, .workflow-card, .summary-card {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="sheet">
        <section class="header">
          <div class="brand">
            <img src="${company.logoSrc}" alt="${escapeHtml(company.logoAlt)}" />
            <div>
              <p class="eyebrow">Expense Claims</p>
              <h1 class="title">${escapeHtml(company.displayName)}</h1>
              <p class="subtitle">Automated PDF generation, approval routing, and accounting handoff for internal claims.</p>
            </div>
          </div>
          <div class="header-meta">
            <div><strong>Generated On</strong></div>
            <div>${generatedOn}</div>
            <div style="margin-top: 10px;"><strong>Access Link</strong></div>
            <div>${escapeHtml(company.routeHint)}</div>
          </div>
        </section>

        <section class="workflow">
          ${workflowCards}
        </section>

        <section class="section">
          <h2 class="section-title">Event Details</h2>
          <div class="details-grid">
            <div class="detail-card"><span>Event Name</span><strong>${escapeHtml(eventDetails.eventName || "N/A")}</strong></div>
            <div class="detail-card"><span>Date</span><strong>${escapeHtml(formatDate(eventDetails.date))}</strong></div>
            <div class="detail-card"><span>Venue</span><strong>${escapeHtml(eventDetails.venue || "N/A")}</strong></div>
            <div class="detail-card"><span>Phone</span><strong>${escapeHtml(eventDetails.phone || "N/A")}</strong></div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Expense Details</h2>
          <div class="table-shell">
            <table>
              <thead>
                <tr>
                  <th style="width: 56px;">S.No</th>
                  <th>Particulars</th>
                  <th style="width: 132px; text-align: right;">Income</th>
                  <th style="width: 132px; text-align: right;">Expenses</th>
                  <th style="width: 160px;">Bills</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section">
          <div class="summary-row-wrap">
            <div class="summary-card">
              <h3>Summary</h3>
              <div class="summary-line">
                <span>Total Income</span>
                <strong class="income">${totalIncomeFormatted}</strong>
              </div>
              <div class="summary-line">
                <span>Total Expenses</span>
                <strong class="expense">${totalExpensesFormatted}</strong>
              </div>
              <div class="summary-line">
                <span>Net Balance</span>
                <strong style="color: ${netBalance >= 0 ? "#15803d" : "#b91c1c"};">${netBalanceFormatted}</strong>
              </div>
              <div class="summary-line">
                <span>GST @ ${gstPercentage}%</span>
                <strong>${gstAmountFormatted}</strong>
              </div>
              <div class="summary-line total">
                <span>Grand Total</span>
                <strong>${grandTotalFormatted}</strong>
              </div>
              <div class="summary-note">
                Prepared by Balakumar, routed to Aishwarya Ma'am for approval, and CCed to accounting automatically.
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Approval Trail</h2>
          <div class="signatures">
            <div class="signature">
              Prepared by
              <strong>Balakumar</strong>
            </div>
            <div class="signature">
              Approved by
              <strong>Aishwarya</strong>
            </div>
            <div class="signature">
              CC to
              <strong>Accounting Team</strong>
            </div>
          </div>
        </section>

        <footer class="footer">
          <div>
            <div>This is a system-generated reimbursement bill.</div>
            <div>Attach invoices and supporting documents before submission.</div>
          </div>
          <div style="text-align: right;">
            <div>${escapeHtml(company.footerLine)}</div>
            <div>Event Finance and Operations</div>
          </div>
        </footer>
      </div>
    </body>
  </html>`;
};
