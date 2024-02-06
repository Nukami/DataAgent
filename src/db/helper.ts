import * as excel from 'exceljs';
import { FilterMethod } from './enums';
import { Production, Condiction } from './types';

const englishToChineseFieldMap: Record<string, string> = {
  sorting: '排序',
  productBrand: '产品品牌',
  productName: '产品名称',
  itemNumber: '货号',
  packingQuantity: '装箱量',
  innerBox: '内箱',
  minOrderQuantity: '起订量',
  productLength: '产品长',
  productWidth: '产品宽',
  productHeight: '产品高',
  packageLength: '包装长',
  packageWidth: '包装宽',
  packageHeight: '包装高',
  packageAttribute: '包装属性',
  outerBoxLength: '外箱长',
  outerBoxWidth: '外箱宽',
  outerBoxHeight: '外箱高',
  volume: '体积',
  grossWeight: '毛重',
  netWeight: '净重',
  factoryPrice1: '出厂价1',
  taxIncludedPrice1: '含税价1',
  shippingPrice1: '含运价1',
  taxIncludedShippingPrice1: '含税运价1',
  onePieceDistributionPrice1: '一件代发价1',
  suggestedRetailPrice: '建议零售价',
  productAttribute: '产品属性',
  suitableChannels: '合适渠道',
  productParametersAndRemarks: '产品参数以及备注',
  certificate: '证书',
  productSalesLink: '产品销售链接',
  factoryPrice2: '出厂价2',
  taxIncludedPrice2: '含税价2',
  shippingPrice2: '含运价2',
  taxIncludedShippingPrice2: '含税运价2',
  onePieceDistributionPrice2: '一件代发价2',
  supplier: '供应商',
  contactInformation: '联系方式',
  isNewProduct: '是否新品',
  rebate: '返点',
  remark1: '备注1',
  connectedChannels: '对接过的渠道',
};

const chineseToEnglishFieldMap: Record<string, string> = {};
for (const key in englishToChineseFieldMap) {
  const value = englishToChineseFieldMap[key];
  chineseToEnglishFieldMap[value] = key;
}

export function isValidField(field: string): boolean {
  return field in englishToChineseFieldMap;
}

export function isValidExcelFile(workbook: excel.Workbook): boolean {
  const filedNames = Object.values(englishToChineseFieldMap);
  try {
    const sheet = workbook.getWorksheet(1);
    if (!sheet) return false;
    if (sheet.columnCount < filedNames.length) return false;
    if (sheet.rowCount < 1) return false;
    for (let i = 1; i <= filedNames.length; i++) {
      const cell = sheet.getCell(1, i);
      if (cell.value !== filedNames[i - 1]) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function executeFilter(production: Production, condition: Condiction) {
  switch (condition.method) {
    case FilterMethod.GreaterThan:
      if (typeof production[condition.field] !== 'number') return false;
      return production[condition.field] >= condition.value;
    case FilterMethod.LessThan:
      if (typeof production[condition.field] !== 'number') return false;
      return production[condition.field] <= condition.value;
    case FilterMethod.Include:
      if (typeof production[condition.field] !== 'string') return false;
      return (production[condition.field] as string).includes(condition.value as string);
    case FilterMethod.NotEmpty:
      if (typeof production[condition.field] !== 'string') return false;
      return (production[condition.field] as string).length > 0;
    case FilterMethod.IsEmpty:
      if (typeof production[condition.field] !== 'string') return false;
      return (production[condition.field] as string).length === 0;
    default:
      return false;
  }
}

export function getProductionFromExcelRow(row: excel.Row): Production {
  return {
    productBrand: row.getCell(2).value?.toString() ?? '',
    productName: row.getCell(3).value?.toString() ?? '',
    itemNumber: row.getCell(4).value?.toString() ?? '',
    packingQuantity: Number(row.getCell(5).value ?? 0),
    innerBox: Number(row.getCell(6).value ?? 0),
    minOrderQuantity: Number(row.getCell(7).value ?? 0),
    productLength: Number(row.getCell(8).value ?? 0),
    productWidth: Number(row.getCell(9).value ?? 0),
    productHeight: Number(row.getCell(10).value ?? 0),
    packageLength: Number(row.getCell(11).value ?? 0),
    packageWidth: Number(row.getCell(12).value ?? 0),
    packageHeight: Number(row.getCell(13).value ?? 0),
    packageAttribute: row.getCell(14).value?.toString() ?? '',
    outerBoxLength: Number(row.getCell(15).value ?? 0),
    outerBoxWidth: Number(row.getCell(16).value ?? 0),
    outerBoxHeight: Number(row.getCell(17).value ?? 0),
    volume: Number(row.getCell(18).value ?? 0),
    grossWeight: Number(row.getCell(19).value ?? 0),
    netWeight: Number(row.getCell(20).value ?? 0),
    factoryPrice1: Number(row.getCell(21).value ?? 0),
    taxIncludedPrice1: Number(row.getCell(22).value ?? 0),
    shippingPrice1: Number(row.getCell(23).value ?? 0),
    taxIncludedShippingPrice1: Number(row.getCell(24).value ?? 0),
    onePieceDistributionPrice1: Number(row.getCell(25).value ?? 0),
    suggestedRetailPrice: Number(row.getCell(26).value ?? 0),
    productAttribute: row.getCell(27).value?.toString() ?? '',
    suitableChannels: row.getCell(28).value?.toString() ?? '',
    productParametersAndRemarks: row.getCell(29).value?.toString() ?? '',
    certificate: row.getCell(30).value?.toString() ?? '',
    productSalesLink: row.getCell(31).value?.toString() ?? '',
    factoryPrice2: Number(row.getCell(32).value ?? 0),
    taxIncludedPrice2: Number(row.getCell(33).value ?? 0),
    shippingPrice2: Number(row.getCell(34).value ?? 0),
    taxIncludedShippingPrice2: Number(row.getCell(35).value ?? 0),
    onePieceDistributionPrice2: Number(row.getCell(36).value ?? 0),
    supplier: row.getCell(37).value?.toString() ?? '',
    contactInformation: row.getCell(38).value?.toString() ?? '',
    isNewProduct: row.getCell(39).value?.toString() ?? '',
    rebate: row.getCell(40).value?.toString() ?? '',
    remark1: row.getCell(41).value?.toString() ?? '',
    connectedChannels: row.getCell(42).value?.toString() ?? '',
  };
}

export function translateChineseToEnglish(chineseFieldName: string): string | undefined {
  return chineseToEnglishFieldMap[chineseFieldName] || undefined;
}

export function translateEnglishToChinese(englishFieldName: string): string | undefined {
  return englishToChineseFieldMap[englishFieldName] || undefined;
}
