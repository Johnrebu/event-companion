import { useState } from "react";
import "./FinancialFormPage.css";

type FormState = Record<string, string>;

export default function FinancialFormPage() {
  const [form, setForm] = useState<FormState>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form);
    alert("Form submitted successfully!");
    // Send to backend / CRM API here
  };

  return (
    <div className="financial-form-page">
      <div className="financial-form-container">
        <h1>Money Pechu - Financial Planning Questionnaire</h1>

        <form onSubmit={handleSubmit}>
          <h2>Personal Details</h2>

          <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
          <input name="age" placeholder="Age" onChange={handleChange} />
          <input name="profession" placeholder="Profession" onChange={handleChange} />
          <input name="mobile" placeholder="Mobile Number" onChange={handleChange} />
          <input name="income" placeholder="Monthly Income (approx)" onChange={handleChange} />

          <h2>Financial Goals</h2>

          <label>Are your investments aligned with goals?</label>
          <select name="alignedGoals" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <textarea name="topGoals" placeholder="Top 3 Financial Goals" onChange={handleChange} />

          <input
            name="retirementAge"
            placeholder="Expected Retirement Age"
            onChange={handleChange}
          />

          <input
            name="retirementIncome"
            placeholder="Expected Monthly Income During Retirement"
            onChange={handleChange}
          />

          <h2>Current Investments</h2>

          <input name="mutualFunds" placeholder="Mutual Funds Value" onChange={handleChange} />
          <input name="stocks" placeholder="Direct Equity Value" onChange={handleChange} />
          <input name="bonds" placeholder="Bonds / Debt Instruments" onChange={handleChange} />
          <input name="fd" placeholder="Fixed Deposits" onChange={handleChange} />
          <input name="gold" placeholder="Gold (grams)" onChange={handleChange} />
          <input name="savings" placeholder="Savings Account Balance" onChange={handleChange} />

          <h2>Insurance Details</h2>

          <label>Health Insurance Available?</label>
          <select name="healthInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <label>Term Insurance Available?</label>
          <select name="termInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
          </select>

          <label>Group Medical Insurance from Company?</label>
          <select name="groupInsurance" onChange={handleChange}>
            <option>Yes</option>
            <option>No</option>
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
          <input name="refRelation" placeholder="Relationship" onChange={handleChange} />
          <input name="refLocation" placeholder="Location" onChange={handleChange} />

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
