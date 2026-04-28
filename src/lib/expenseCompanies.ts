import aionionCapitalLogo from "@/assets/company-logos/aionion-capital-logo.png";
import anshulLogo from "@/assets/company-logos/anshul-a-gupta-associates-logo.png";
import coronaLogo from "@/assets/corona-logo.png";
import quanticusLogo from "@/assets/company-logos/quanticus-logo.svg";

export interface ExpenseCompany {
  slug: string;
  displayName: string;
  legalName: string;
  logoSrc: string;
  logoAlt: string;
  routeHint: string;
  metaDescription: string;
  screenGradientClass: string;
  printAccentColor: string;
  printAccentSoftColor: string;
  printBorderColor: string;
  footerLine: string;
}

export const EXPENSE_COMPANIES = [
  {
    slug: "corona-creative",
    displayName: "Corona Creative",
    legalName: "Corona Creative Solutions",
    logoSrc: coronaLogo,
    logoAlt: "Corona Creative Solutions logo",
    routeHint: "Default access point",
    metaDescription:
      "Internal expense claims workspace for Corona Creative with PDF generation, approval routing, and accounting handoff.",
    screenGradientClass: "from-amber-500 via-orange-500 to-rose-500",
    printAccentColor: "#f59e0b",
    printAccentSoftColor: "#fff7ed",
    printBorderColor: "#fbbf24",
    footerLine: "Corona Creative Solutions",
  },
  {
    slug: "aionion-capital",
    displayName: "Aionion Capital",
    legalName: "Aionion Capital",
    logoSrc: aionionCapitalLogo,
    logoAlt: "Aionion Capital logo",
    routeHint: "Entity-specific access link",
    metaDescription:
      "Aionion Capital expense claims workspace with branded PDF output, approval routing, and accounting notifications.",
    screenGradientClass: "from-blue-700 via-indigo-700 to-rose-500",
    printAccentColor: "#1d4ed8",
    printAccentSoftColor: "#eff6ff",
    printBorderColor: "#60a5fa",
    footerLine: "Aionion Capital",
  },
  {
    slug: "anshul-a-gupta-associates",
    displayName: "Anshul A Gupta & Associates",
    legalName: "Anshul A Gupta & Associates",
    logoSrc: anshulLogo,
    logoAlt: "Anshul A Gupta & Associates logo",
    routeHint: "Entity-specific access link",
    metaDescription:
      "Anshul A Gupta & Associates claims workspace with company branding, PDF generation, and automated approval handoff.",
    screenGradientClass: "from-emerald-600 via-teal-600 to-cyan-500",
    printAccentColor: "#059669",
    printAccentSoftColor: "#ecfdf5",
    printBorderColor: "#34d399",
    footerLine: "Anshul A Gupta & Associates",
  },
  {
    slug: "quanticus",
    displayName: "Quanticus",
    legalName: "Quanticus",
    logoSrc: quanticusLogo,
    logoAlt: "Quanticus logo",
    routeHint: "Entity-specific access link",
    metaDescription:
      "Quanticus expense claims workspace with branded access, automated PDF generation, and manager-to-accounting routing.",
    screenGradientClass: "from-violet-600 via-fuchsia-500 to-cyan-500",
    printAccentColor: "#7c3aed",
    printAccentSoftColor: "#f5f3ff",
    printBorderColor: "#a78bfa",
    footerLine: "Quanticus",
  },
] as const satisfies readonly ExpenseCompany[];

export type ExpenseCompanySlug = (typeof EXPENSE_COMPANIES)[number]["slug"];

export const DEFAULT_EXPENSE_COMPANY_SLUG: ExpenseCompanySlug = "corona-creative";

const EXPENSE_COMPANY_BY_SLUG = Object.fromEntries(
  EXPENSE_COMPANIES.map((company) => [company.slug, company]),
) as Record<ExpenseCompanySlug, (typeof EXPENSE_COMPANIES)[number]>;

export const EXPENSE_WORKFLOW_STEPS = [
  {
    label: "Prepared by",
    value: "Balakumar",
  },
  {
    label: "Reporting manager",
    value: "Aishwarya",
  },
  {
    label: "Accounting copy",
    value: "Auto CC",
  },
] as const;

export const getExpenseCompany = (slug?: string | null) => {
  const normalized = slug?.trim().toLowerCase();

  if (normalized && normalized in EXPENSE_COMPANY_BY_SLUG) {
    return EXPENSE_COMPANY_BY_SLUG[normalized as ExpenseCompanySlug];
  }

  return EXPENSE_COMPANY_BY_SLUG[DEFAULT_EXPENSE_COMPANY_SLUG];
};

export const getExpenseCompanyPath = (slug: ExpenseCompanySlug) =>
  slug === DEFAULT_EXPENSE_COMPANY_SLUG ? "/expenses" : `/expenses/${slug}`;

export const getExpenseDraftStorageKey = (slug: ExpenseCompanySlug) => `expense-report-${slug}`;

export const getExpensePageTitle = (company: ExpenseCompany) =>
  `Expense Command Center | ${company.displayName}`;

export const getExpensePageDescription = (company: ExpenseCompany) => company.metaDescription;

