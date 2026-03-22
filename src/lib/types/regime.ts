export interface LocalizedString {
  [lang: string]: string
}

export interface Source {
  title: LocalizedString
  url: string
}

export interface Definition {
  key: string
  name: LocalizedString
  desc?: LocalizedString
  sources?: Source[]
  values?: DefinitionValue[]
}

export interface DefinitionValue {
  code: string
  name: LocalizedString
  desc?: LocalizedString
}

export interface TagSet {
  schema?: string
  list?: Definition[]
}

export interface ScenarioNote {
  key: string
  src: string
  text: string
}

export interface Scenario {
  tags?: string[]
  note?: ScenarioNote
  ext?: Record<string, string>
}

export interface ScenarioSet {
  schema: string
  list: Scenario[]
}

export interface CorrectionDefinition {
  schema: string
  types: string[]
  extensions?: string[]
  reason_required?: boolean
  stamps?: string[]
}

export interface RateValue {
  since?: string
  percent: string
  surcharge?: string
  disabled?: boolean
  tags?: string[]
  ext?: Record<string, string>
}

export interface RateDef {
  rate: string
  keys?: string[]
  name: LocalizedString
  desc?: LocalizedString
  values: RateValue[]
}

export interface CategoryDef {
  code: string
  name: LocalizedString
  title?: LocalizedString
  desc?: LocalizedString
  retained?: boolean
  rates?: RateDef[]
  keys?: Definition[]
  extensions?: string[]
  sources?: Source[]
}

export interface Regime {
  $schema: string
  name: LocalizedString
  description?: LocalizedString
  sources?: Source[]
  time_zone: string
  country: string
  alt_country_codes?: string[]
  currency: string
  tax_scheme?: string
  tags?: TagSet[]
  identities?: Definition[]
  extensions?: Definition[]
  scenarios?: ScenarioSet[]
  corrections?: CorrectionDefinition[]
  categories: CategoryDef[]
}
