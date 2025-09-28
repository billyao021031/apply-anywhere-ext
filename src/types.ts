export interface Profile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  workAuth: {
    needsSponsorship: boolean;
    authorizedToWork: boolean;
    visaStatus?: string;
  };
  voluntary: {
    gender?: string;
    race?: string;
    veteran?: boolean;
    disability?: boolean;
  };
  documents: {
    resume?: string;
    coverLetter?: string;
  };
}

export interface CanonicalMap {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  work_auth_need_sponsorship: string;
  work_auth_authorized: string;
  eeo_gender?: string;
  eeo_race?: string;
  eeo_veteran?: string;
  eeo_disability?: string;
}

export interface FieldProposal {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  key: string;
  label: string;
  proposedValue: string;
  editable: boolean;
}

export type SiteType = 'linkedin' | 'greenhouse' | 'lever' | 'workday' | 'generic';
