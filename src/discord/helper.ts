import * as excel from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';
import pptxgenjs from 'pptxgenjs';
import { Production } from '../db';
import { translateEnglishToChinese } from '../db/helper';
import { GlobalStorage } from '../global-storage';

export async function generatePublicExcel(id: string, productions: Production[]): Promise<string> {
  const fields: (keyof Production)[] = [
    'productBrand',
    'productName',
    'itemNumber',
    'packingQuantity',
    'innerBox',
    'minOrderQuantity',
    'productLength',
    'productWidth',
    'productHeight',
    'packageLength',
    'packageWidth',
    'packageHeight',
    'packageAttribute',
    'outerBoxLength',
    'outerBoxWidth',
    'outerBoxHeight',
    'volume',
    'grossWeight',
    'netWeight',
    'factoryPrice1',
    'taxIncludedPrice1',
    'shippingPrice1',
    'taxIncludedShippingPrice1',
    'onePieceDistributionPrice1',
    'suggestedRetailPrice',
    'productAttribute',
    'suitableChannels',
    'productParametersAndRemarks',
    'certificate',
    'productSalesLink',
  ];
  const wb = new excel.Workbook();
  const sheet = wb.addWorksheet('Sheet1');
  sheet.columns = [
    { key: 'id', header: '排序' },
    ...fields.map(f => ({ key: f, header: translateEnglishToChinese(f) })),
  ];
  for (let i = 0; i < productions.length; i++) {
    sheet.addRow({ id: i + 1, ...productions[i] });
  }
  const outputPath = path.resolve(`cache/${id}-public.xlsx`);
  await wb.xlsx.writeFile(outputPath);
  return outputPath;
}

export async function generatePrivateExcel(id: string, productions: Production[]): Promise<string> {
  const fields: (keyof Production)[] = [
    'productBrand',
    'productName',
    'itemNumber',
    'packingQuantity',
    'innerBox',
    'minOrderQuantity',
    'productLength',
    'productWidth',
    'productHeight',
    'packageLength',
    'packageWidth',
    'packageHeight',
    'packageAttribute',
    'outerBoxLength',
    'outerBoxWidth',
    'outerBoxHeight',
    'volume',
    'grossWeight',
    'netWeight',
    'factoryPrice1',
    'taxIncludedPrice1',
    'shippingPrice1',
    'taxIncludedShippingPrice1',
    'onePieceDistributionPrice1',
    'suggestedRetailPrice',
    'productAttribute',
    'suitableChannels',
    'productParametersAndRemarks',
    'certificate',
    'productSalesLink',
    'factoryPrice2',
    'taxIncludedPrice2',
    'shippingPrice2',
    'taxIncludedShippingPrice2',
    'onePieceDistributionPrice2',
    'supplier',
    'contactInformation',
    'isNewProduct',
    'rebate',
    'remark1',
    'connectedChannels',
  ];
  const wb = new excel.Workbook();
  const sheet = wb.addWorksheet('Sheet1');
  sheet.columns = [
    { key: 'id', header: '排序' },
    ...fields.map(f => ({ key: f, header: translateEnglishToChinese(f) })),
  ];
  for (let i = 0; i < productions.length; i++) {
    sheet.addRow({ id: i + 1, ...productions[i] });
  }
  const outputPath = path.resolve(`cache/${id}.xlsx`);
  await wb.xlsx.writeFile(outputPath);
  return outputPath;
}

function genHeaderRows(production: Production): pptxgenjs.TableRow[] {
  const leftStr: string =
    `产品名称：${production.productName}\n` +
    `产品品牌：${production.productBrand}\n` +
    `产品尺寸：${production.productLength}x${production.productWidth}x${production.productHeight}\n` +
    `包装尺寸：${production.packageLength}x${production.packageWidth}x${production.packageHeight}\n` +
    `外箱尺寸：${production.outerBoxLength}x${production.outerBoxWidth}x${production.outerBoxHeight}\n` +
    `包装属性：${production.packageAttribute}\n` +
    `装箱量：${production.packingQuantity}\n` +
    `起订量：${production.minOrderQuantity}\n` +
    `毛（净）重：${production.grossWeight}（${production.netWeight}）\n` +
    `备注：${production.productParametersAndRemarks}`;

  const rightStr: string =
    `出厂价：${production.factoryPrice1}\n` +
    `含税价：${production.taxIncludedPrice1}\n` +
    `含运价：${production.shippingPrice1}\n` +
    `一件代发价：${production.onePieceDistributionPrice1}\n` +
    `建议零售价：${production.suggestedRetailPrice}`;

  const headerRows: pptxgenjs.TableRow[] = [
    [
      { text: '产品信息', options: { align: 'left', bold: true } },
      { text: '产品图片', options: { align: 'center', bold: true } },
      { text: '产品价格', options: { align: 'right', bold: true } },
    ],
    [
      { text: leftStr, options: { align: 'left' } },
      { text: '', options: { align: 'center' } },
      { text: rightStr, options: { align: 'right' } },
    ],
    [
      { text: '产品销售链接', options: { align: 'left', valign: 'bottom' } },
      { text: '', options: { align: 'center', valign: 'bottom' } },
      { text: '', options: { align: 'right', valign: 'bottom' } },
    ],
    [
      { text: production.productSalesLink, options: { align: 'left', valign: 'bottom' } },
      { text: '', options: { align: 'center', valign: 'bottom' } },
      { text: '', options: { align: 'right', valign: 'bottom' } },
    ],
  ];

  return headerRows;
}

export async function generatePPTX(id: string, productions: Production[]): Promise<string[]> {
  const globalStorage = GlobalStorage.getInstance();
  const maxFileSize = (25 - 1) * 1024 * 1024;
  const outputPaths: string[] = [];
  let sizeOfAddedPics = 0;
  let currentSliceNumber = 1;

  const dbPath = path.resolve(globalStorage.getConfig().db.path);
  let ppt = new pptxgenjs();
  for (const production of productions) {
    const imagePath = path.resolve(`${dbPath}/${production.productBrand}/${production.itemNumber}.jpg`);
    const imageFileExist = fs.existsSync(imagePath);
    const picSize = imageFileExist ? fs.statSync(imagePath).size : 0;
    const hasImage = imageFileExist && picSize < maxFileSize;
    const hasToSlice = hasImage && sizeOfAddedPics + picSize > maxFileSize;

    if (hasToSlice) {
      const outputPath = path.resolve(`cache/${id}-${currentSliceNumber}.pptx`);
      await ppt.writeFile({
        fileName: outputPath,
      });
      outputPaths.push(outputPath);
      ppt = new pptxgenjs();
      currentSliceNumber++;
      sizeOfAddedPics = 0;
    }

    const slide = ppt.addSlide();

    if (hasImage) {
      slide.addImage({
        path: imagePath,
        x: '25%',
        y: '15%',
        w: '50%',
        h: '80%',
      });
      sizeOfAddedPics += picSize;
    }

    slide.addTable(genHeaderRows(production), { valign: 'top' });
  }

  const outputPath = path.resolve(`cache/${currentSliceNumber === 1 ? id : `${id}-${currentSliceNumber}`}.pptx`);
  await ppt.writeFile({
    fileName: outputPath,
  });
  outputPaths.push(outputPath);

  return outputPaths;
}
