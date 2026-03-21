import type {
  LocalizedString,
  Source,
  Definition,
  ScenarioSet,
  CorrectionDefinition,
  TagSet
} from './regime'

export interface Addon {
  $schema: string
  key: string
  name: LocalizedString
  description?: LocalizedString
  sources?: Source[]
  extensions?: Definition[]
  tags?: TagSet[]
  scenarios?: ScenarioSet[]
  corrections?: CorrectionDefinition[]
}
