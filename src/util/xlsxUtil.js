const XLSX = require('xlsx')
export function excelToJson (arrayBuffer) {
  const data = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(data, {
    type: 'array'
  })
  let result = {}
  workbook.SheetNames.forEach(e => {
    result[e] = XLSX.utils.sheet_to_json(workbook.Sheets[e], { defval: '' })
  })
  return result
}

export function jsonToExcel (jsonArray) {
  const workbook = XLSX.utils.book_new()
  Object.keys(jsonArray).forEach(function (key) {
    let worksheet = XLSX.utils.json_to_sheet(jsonArray[key])
    XLSX.utils.book_append_sheet(workbook, worksheet, key)
  })
  const wopts = { bookType: 'xlsx', bookSST: false, type: 'array' }
  const wbout = XLSX.write(workbook, wopts)
  return wbout
}

export default {
  excelToJson,
  jsonToExcel
}
