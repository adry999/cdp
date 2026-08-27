export interface ServiceItemRow {
  label_ro: string
  label_en: string | null
  body_ro: string
  body_en: string | null
  sort_order: number
}

export interface ServiceRow {
  key: string
  level_label_ro: string
  level_label_en: string | null
  name_ro: string
  name_en: string | null
  heading_ro: string
  heading_en: string | null
  body_ro: string
  body_en: string | null
  duration_ro: string | null
  duration_en: string | null
  price_from: number | null
  currency: string
  layout: string
  sort_order: number
  service_items: ServiceItemRow[]
}

export interface StackGroupRow {
  name: string
  items: string[]
  sort_order: number
}

export interface ProcessStepRow {
  title_ro: string
  title_en: string | null
  body_ro: string
  body_en: string | null
  sort_order: number
}

export interface FaqRow {
  question_ro: string
  question_en: string | null
  answer_ro: string
  answer_en: string | null
  sort_order: number
}

export interface SiteSettingsRow {
  contact_email: string
  contact_phone: string | null
  hours: string | null
  response_time_ro: string | null
  response_time_en: string | null
  next_opening_ro: string | null
  next_opening_en: string | null
  concurrent_projects: string | null
  nda_note_ro: string | null
  nda_note_en: string | null
  footer_line_ro: string | null
  footer_line_en: string | null
  copyright_year: number | null
  meta_title_ro: string | null
  meta_title_en: string | null
  meta_description_ro: string | null
  meta_description_en: string | null
  og_image_path: string | null
}

export interface HomeApiResponse {
  services: ServiceRow[]
  stackGroups: StackGroupRow[]
  processSteps: ProcessStepRow[]
  faqs: FaqRow[]
  settings: SiteSettingsRow | null
}
