// StudentProfile shape:
//   { country: string, visaType: "F-1"|"J-1"|"H-1B"|"M-1"|"Other",
//     taxYear: "2023"|"2024"|"2025", state: string (2-letter e.g. "CA"),
//     incomeSources: Array<"opt_job"|"cpt_job"|"scholarship"|"no_income"> }
//
// TaxGuide shape (returned by generateTaxGuide):
//   { residencyStatus: "Non-Resident Alien"|"Resident Alien",
//     summary: string, hasTreatyNote: boolean, stateNote: string,
//     forms: TaxForm[], steps: TaxStep[], documents: TaxDocument[] }
//
// TaxForm:    { id, name, description, url, required: boolean }
// TaxStep:    { step: number, title, description }
// TaxDocument:{ id, label, description, required: boolean }

import { TAX_TREATY_COUNTRIES, NO_TAX_STATES, IRS_URLS } from "./constants.js";

export function generateTaxGuide(profile) {
  const residencyStatus = determineResidency(profile.visaType);
  const isNonResident = residencyStatus === "Non-Resident Alien";
  const hasIncome = hasAnyIncome(profile.incomeSources);
  const hasEmployment = hasEmploymentIncome(profile.incomeSources);
  const hasScholarship = profile.incomeSources.includes("scholarship");

  return {
    residencyStatus,
    summary: buildSummary(profile, residencyStatus, hasIncome),
    hasTreatyNote: TAX_TREATY_COUNTRIES.has(profile.country.trim()),
    stateNote: buildStateNote(profile.state),
    forms: buildForms(isNonResident, hasIncome),
    steps: buildSteps(isNonResident, hasIncome),
    documents: buildDocuments(profile.visaType, hasEmployment, hasScholarship),
  };
}

function determineResidency(visaType) {
  return ["F-1", "J-1", "M-1"].includes(visaType)
    ? "Non-Resident Alien"
    : "Resident Alien";
}

function hasAnyIncome(incomeSources) {
  return incomeSources.some((s) => s !== "no_income");
}

function hasEmploymentIncome(incomeSources) {
  return incomeSources.includes("opt_job") || incomeSources.includes("cpt_job");
}

function buildForms(isNonResident, hasIncome) {
  const forms = [];

  if (isNonResident) {
    forms.push({
      id: "8843",
      name: "Form 8843",
      description: "Statement for Exempt Individuals — required even with no income",
      url: IRS_URLS["8843"],
      required: true,
    });
    if (hasIncome) {
      forms.push({
        id: "1040-NR",
        name: "Form 1040-NR",
        description: "U.S. Nonresident Alien Income Tax Return",
        url: IRS_URLS["1040-NR"],
        required: true,
      });
    }
  } else if (hasIncome) {
    forms.push({
      id: "1040",
      name: "Form 1040",
      description: "U.S. Individual Income Tax Return",
      url: IRS_URLS["1040"],
      required: true,
    });
  }

  return forms;
}

function buildDocuments(visaType, hasEmployment, hasScholarship) {
  const docs = [
    {
      id: "passport",
      label: "Passport",
      description: "Your valid passport for identity verification",
      required: true,
    },
    {
      id: "visa",
      label: "Visa / Entry Stamp",
      description: "Your visa and most recent US entry stamp",
      required: true,
    },
  ];

  if (visaType === "F-1" || visaType === "M-1") {
    docs.push({
      id: "i20",
      label: "Form I-20",
      description: "Certificate of Eligibility issued by your school's DSO",
      required: true,
    });
  } else if (visaType === "J-1") {
    docs.push({
      id: "ds2019",
      label: "Form DS-2019",
      description: "Certificate of Eligibility for Exchange Visitor Status",
      required: true,
    });
  }

  if (hasEmployment) {
    docs.push({
      id: "w2",
      label: "Form W-2",
      description: "Wage and Tax Statement from your employer (OPT/CPT)",
      required: true,
    });
  }

  if (hasScholarship) {
    docs.push({
      id: "1042s",
      label: "Form 1042-S",
      description:
        "Foreign Person's U.S. Source Income — issued by your school for scholarships/stipends",
      required: true,
    });
  }

  return docs;
}

function buildSteps(isNonResident, hasIncome) {
  const steps = [];
  let n = 1;

  steps.push({
    step: n++,
    title: "Determine your residency status",
    description: isNonResident
      ? "As an F-1, J-1, or M-1 visa holder you are generally a Non-Resident Alien during your exempt period — you are not subject to the Substantial Presence Test."
      : "As an H-1B holder you likely meet the Substantial Presence Test and file as a Resident Alien, the same as a US citizen.",
  });

  steps.push({
    step: n++,
    title: "Gather your documents",
    description:
      "Collect your passport, visa/entry stamp, I-20 or DS-2019, and any income documents (W-2, 1042-S) before you start.",
  });

  if (isNonResident) {
    steps.push({
      step: n++,
      title: "Complete Form 8843",
      description:
        "All non-resident aliens who were in the US during the tax year must file this statement, even with zero income. Your school's International Student Office may help.",
    });

    if (hasIncome) {
      steps.push({
        step: n++,
        title: "Complete Form 1040-NR",
        description:
          "Report your US-source income on this return. Software such as Sprintax or Glacier Tax Prep is designed specifically for non-residents.",
      });

      steps.push({
        step: n++,
        title: "Check your tax treaty benefits",
        description:
          "Many countries have treaties with the US that reduce or eliminate tax on certain income. Review IRS Publication 901 for your country.",
      });
    }
  } else if (hasIncome) {
    steps.push({
      step: n++,
      title: "Complete Form 1040",
      description:
        "File the standard US individual income tax return. IRS Free File options are available at irs.gov/freefile.",
    });
  }

  steps.push({
    step: n++,
    title: "File your state return if required",
    description:
      "Check whether your state has income tax and whether you meet the filing threshold. Some states mirror the federal non-resident rules.",
  });

  steps.push({
    step: n++,
    title: "Submit before the deadline",
    description:
      "Federal deadline is April 15. Non-residents abroad get an automatic 2-month extension to June 15. Form 4868 grants residents a 6-month extension.",
  });

  return steps;
}

function buildStateNote(state) {
  const code = state.trim().toUpperCase();
  if (NO_TAX_STATES.has(code)) {
    return `${state} has no state income tax — you do not need to file a state return.`;
  }
  return `${state} has a state income tax. If you earned income in ${state}, you likely need to file a state return in addition to your federal return. Check your state's Department of Revenue website for non-resident filing rules.`;
}

const INCOME_LABELS = {
  opt_job: "OPT employment",
  cpt_job: "CPT employment",
  scholarship: "scholarship or stipend",
};

function buildSummary(profile, residencyStatus, hasIncome) {
  const { country, visaType, taxYear, incomeSources } = profile;

  if (!hasIncome) {
    return (
      `As a ${visaType} visa holder from ${country}, you are classified as a ${residencyStatus} for US tax purposes. ` +
      `Since you have no US income for ${taxYear}, your main requirement is filing Form 8843 — a simple statement, not a tax return.`
    );
  }

  const incomeDesc = incomeSources
    .filter((s) => s !== "no_income")
    .map((s) => INCOME_LABELS[s] || s)
    .join(", ");

  const formsNeeded =
    residencyStatus === "Non-Resident Alien"
      ? "Forms 8843 and 1040-NR"
      : "Form 1040";

  const treatySentence = TAX_TREATY_COUNTRIES.has(country.trim())
    ? ` ${country} has a tax treaty with the US that may reduce your tax liability — check IRS Publication 901.`
    : "";

  return (
    `As a ${visaType} visa holder from ${country}, you are classified as a ${residencyStatus} for ${taxYear}. ` +
    `You have ${incomeDesc} income, which means you need to file ${formsNeeded}.${treatySentence}`
  );
}
