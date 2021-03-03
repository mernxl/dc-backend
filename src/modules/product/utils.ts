import { readFile } from 'fs';
import * as handlebars from 'handlebars';
import path from 'path';
import { mergeDeepRight } from 'ramda';
import { promisify } from 'util';

export interface ReceiptProduct {
  name: string;
  quantity: number;
  value: number;
}
export interface ReceiptData {
  date: string;
  total: number;
  products: ReceiptProduct[];
}

interface ConfigData {
  app: {
    name: string;
  };
  school: {
    name: string;
  };
  shopName: string;
  footerText: string;
}

handlebars.registerHelper('currency', function (amount) {
  return Intl.NumberFormat('en', { style: 'currency', currency: 'XAF' }).format(amount);
});

let template: handlebars.Template | undefined = undefined;
let configData: ConfigData | undefined = undefined;
export const parseHTML = async (data: ReceiptData): Promise<string> => {
  const pathToConfig = path.resolve('templates/app.json');
  const pathToTemplate = path.resolve('templates/template.hbs');

  if (!template) {
    const file = await promisify(readFile)(pathToTemplate);

    template = handlebars.compile(file.toString());
  }

  if (!configData) {
    configData = JSON.parse((await promisify(readFile)(pathToConfig)).toString()) as ConfigData;
  }

  return typeof template === 'string'
    ? template
    : template(mergeDeepRight(configData, data), { allowProtoPropertiesByDefault: true });
};
