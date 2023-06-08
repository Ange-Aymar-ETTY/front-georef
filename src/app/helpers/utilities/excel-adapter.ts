import * as XLSX from 'xlsx';

const getFileName = (name: string) => {
  const timeSpan = new Date().toISOString();
  const sheetName = name || 'ExportResult';
  const fileName = `${sheetName}-${timeSpan}`;

  return {
    sheetName,
    fileName
  };
};

export class ExcelAdapter {

  static tableToExcel(tableId: string, name?: string) {
    const { sheetName, fileName } = getFileName(name);
    const targetTableElm = document.getElementById(tableId);
    const wb = XLSX.utils.table_to_book(targetTableElm, { sheet: sheetName } as XLSX.Table2SheetOpts);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static arrayToExcel(data: any[], name?: string) {
    const { sheetName, fileName } = getFileName(name);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static excelToJson(arrayBuffer: ArrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    const arr = new Array();
    for (let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
    const bstr = arr.join("");
    const workbook = XLSX.read(bstr, { type: "binary" });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];

    return XLSX.utils.sheet_to_json(worksheet, { raw: true });
  }
}
