import { FilterMethod } from './enums';

export type Production = {
  productBrand: string;
  productName: string;
  itemNumber: string;
  packingQuantity: number;
  innerBox: number;
  minOrderQuantity: number;
  productLength: number;
  productWidth: number;
  productHeight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;
  packageAttribute: string;
  outerBoxLength: number;
  outerBoxWidth: number;
  outerBoxHeight: number;
  volume: number;
  grossWeight: number;
  netWeight: number;
  factoryPrice1: number;
  taxIncludedPrice1: number;
  shippingPrice1: number;
  taxIncludedShippingPrice1: number;
  onePieceDistributionPrice1: number;
  suggestedRetailPrice: number;
  productAttribute: string;
  suitableChannels: string;
  productParametersAndRemarks: string;
  certificate: string;
  productSalesLink: string;
  factoryPrice2: number;
  taxIncludedPrice2: number;
  shippingPrice2: number;
  taxIncludedShippingPrice2: number;
  onePieceDistributionPrice2: number;
  supplier: string;
  contactInformation: string;
  connectedChannels: string;
  isNewProduct: string;
  rebate: string;
  remark1: string;
};

export type Condiction = { field: keyof Production; method: FilterMethod; value: string | number };

export type StringProperties = {
  [K in keyof Production]: Production[K] extends number ? never : K;
}[keyof Production];

export type NumbericProperties = {
  [K in keyof Production]: Production[K] extends number ? K : never;
}[keyof Production];
