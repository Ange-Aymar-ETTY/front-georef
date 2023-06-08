import * as _ from "lodash";
import * as XLSX from "xlsx";
import readXlsxFile, { Schema } from "read-excel-file";

export const excelReader = (f: File, schema: Schema) => {
  return readXlsxFile(f, { schema })
}

export const groupErrors = (erros: any[]) => {
  return _(erros)
    .groupBy('column')
    .map((data, column) => ({ column, rows: data.map((u: any) => Number(u.row + 1)).join(", ") }))
    .value();
}
