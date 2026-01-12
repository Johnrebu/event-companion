import { forwardRef } from "react";
import { ExpenseItem, EventDetails } from "@/types/expense";
import ainionLogo from "@/assets/aionion-logo.png";

interface PrintReportProps {
  eventDetails: EventDetails;
  items: ExpenseItem[];
  gstPercentage: number;
}

const PrintReport = forwardRef<HTMLDivElement, PrintReportProps>(
  ({ eventDetails, items, gstPercentage }, ref) => {
    const totalIncome = items.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = items.reduce((sum, item) => sum + item.expenses, 0);
    const netAmount = totalIncome - totalExpenses;
    const gstAmount = (totalExpenses * gstPercentage) / 100;
    const grandTotal = totalExpenses + gstAmount;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    return (
      <div ref={ref} className="print-report bg-white p-8 text-black">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={ainionLogo} alt="Aionion Capital" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Aionion Capital</h1>
              <p className="text-sm text-gray-600">Event Expense Report</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Report Generated:</p>
            <p className="font-semibold">{new Date().toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        {/* Event Details */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Event Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Event Name:</span>
              <span className="ml-2 font-medium">{eventDetails.eventName || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium">{formatDate(eventDetails.date)}</span>
            </div>
            <div>
              <span className="text-gray-600">Venue:</span>
              <span className="ml-2 font-medium">{eventDetails.venue || "N/A"}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{eventDetails.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Expense Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Expense Details</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-300 px-3 py-2 text-left w-12">S.No</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Particulars</th>
                <th className="border border-gray-300 px-3 py-2 text-right w-28">Income</th>
                <th className="border border-gray-300 px-3 py-2 text-right w-28">Expenses</th>
                <th className="border border-gray-300 px-3 py-2 text-center w-20">Bills</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-3 py-2 text-center">{item.sNo}</td>
                  <td className="border border-gray-300 px-3 py-2">{item.particulars || "-"}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-green-700 font-medium">
                    {item.income > 0 ? formatCurrency(item.income) : "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-red-700 font-medium">
                    {item.expenses > 0 ? formatCurrency(item.expenses) : "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {item.billFileName ? "✓" : "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-80 bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Income:</span>
                <span className="font-medium text-green-700">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-medium text-red-700">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Net Balance:</span>
                <span className={`font-semibold ${netAmount >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatCurrency(netAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST @ {gstPercentage}%:</span>
                <span className="font-medium">{formatCurrency(gstAmount)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-800 pt-2 mt-2">
                <span className="font-bold text-gray-900">Grand Total:</span>
                <span className="font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8">
          <div className="flex justify-between text-xs text-gray-500">
            <div>
              <p>This is a computer-generated report.</p>
              <p>For any queries, please contact the event management team.</p>
            </div>
            <div className="text-right">
              <p>Aionion Capital</p>
              <p>Event Management Division</p>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-600">Prepared By</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mx-8">
              <p className="text-sm text-gray-600">Approved By</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintReport.displayName = "PrintReport";

export default PrintReport;
