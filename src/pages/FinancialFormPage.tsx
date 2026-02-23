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
