export interface Schema {
  project?: string;
  mode?: 'per-component' | 'merged';
  targetLocales?: string[];
}
