export interface APIResponse {
  data: any;
  error: boolean;
  message: string;
}

export interface Polygone {
  name: string;
  location: {
    features: any;
  };
}

export interface FormatColumn {
  libelle: string;
  title: string;
  type: string;
}

export interface TableFilter {
  filter: boolean;
  search: string;
  [propName: string]: any;
}
