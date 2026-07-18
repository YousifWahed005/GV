export type PaymentMethod = "Instapay" | "Vodafone Cash" | "Cash";
export type RegistrationStatus = "Pending Approval" | "Approved" | "Rejected" | "Checked In";

export type Registration = {
  referenceId: string;
  timestamp: string;
  // Step 1
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  discountPercentage: number;
  finalPrice: number;
  nationalIdFrontUrl: string;
  nationalIdBackUrl: string;
  paymentScreenshotUrl?: string;
  // Step 2 (optional)
  university?: string;
  major?: string;
  allergy?: string;
  allergyNotes?: string;
  availableFullDay?: boolean;
  interests?: string[];
  heardFrom?: string;
  // Status
  status: RegistrationStatus;
  ticketUrl?: string;
  qrDataUrl?: string;
  rejectionReason?: string;
  checkedInAt?: string;
};

export type Country = {
  id: string;
  name: string;
  flagCode: string; // ISO 3166-1 alpha-2 for flagcdn.com
  image: string;
  about: string;
  history: string;
  food: string;
  dance: string;
  landmarks: string;
  funFact: string;
  gallery?: string[];
  sortOrder: number;
};

export type SponsorTier = "Platinum" | "Gold" | "Silver";

export type Sponsor = {
  id: string;
  name: string;
  logo: string;
  websiteUrl: string;
  tier: SponsorTier;
  active: boolean;
  sortOrder: number;
};

export type RecapMediaType = "video" | "image";

export type RecapItem = {
  id: string;
  year: number;
  title: string;
  mediaType: RecapMediaType;
  mediaUrl: string;
  sortOrder: number;
};

export type PromoCodeStatus = "Active" | "Disabled";

export type PromoCode = {
  id: string;
  code: string;
  discountAmount: number;
  expirationDate: string;
  usageLimit: number;
  usageCount: number;
  status: PromoCodeStatus;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  x?: string;
};

export type ContactInfo = {
  email?: string;
  phone?: string;
  address?: string;
};

export type QuickLink = {
  id: string;
  label: string;
  href: string;
  sortOrder: number;
};

export type FooterSettings = {
  socials: SocialLinks;
  contact: ContactInfo;
  quickLinks: QuickLink[];
};

export type HeroSettings = {
  eventName: string;
  tagline: string;
  date: string;
  location: string;
};

export type EventSettings = {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketPrice: number;
  registrationOpen: boolean;
  maxRegistrations: number;
  hero: HeroSettings;
  footer: FooterSettings;
};
