import express from 'express';
import fs, { createReadStream, exists, mkdir } from 'fs';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import moment from 'moment';
import path from 'path';
import { uniq } from 'ramda';
import { Body, Controller, Delete, Get, Path, Post, Put, Query, Request, Route, Tags } from 'tsoa';
import { promisify } from 'util';

import { cloxel } from '../../config/cloxel';
import { ErrorResponse, Page, PageQueryParam, PerPageQueryParam } from '../../utils';
import { ProductModel } from './product/model';
import { Product, ProductCreateInput, ProductReceiptInput, ProductUpdateInput } from './types';
import { parseHTML, ReceiptData, ReceiptProduct } from './utils';

@Tags('Product')
@Route('products')
export class ProductController extends Controller {
  /**
   * @summary Page through all products stored
   */
  @Get()
  async page(
    @Request() req: express.Request,
    @Query() page: PageQueryParam = 1,
    @Query('per_page') perPage: PerPageQueryParam = 30,
  ): Promise<Page<Product>> {
    return ProductModel.paginate(
      ProductModel.find().sort('name'),
      { path: req.path, page, perPage },
      (dataItem) => dataItem.view(),
    );
  }

  /**
   * @summary Create a product
   */
  @Post()
  async createOne(
    @Request() req: express.Request,
    @Body() body: ProductCreateInput,
  ): Promise<Product> {
    const product = new ProductModel(body);

    await product.save();

    return product.view();
  }

  /**
   * @summary Update a product
   */
  @Put('/:id')
  async updateOne(
    @Request() req: express.Request,
    @Path() id: number,
    @Body() body: ProductUpdateInput,
  ): Promise<Product> {
    const product = await ProductModel.findById(id).exec();

    if (!product) {
      throw new ErrorResponse(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    }

    product.set(body);

    await product.save();

    return product.view();
  }

  /**
   * @summary Delete a product
   */
  @Delete('/:id')
  async deleteOne(@Request() req: express.Request, @Path() id: number): Promise<void> {
    const product = await ProductModel.findById(id).exec();

    if (!product) {
      throw new ErrorResponse(ReasonPhrases.NOT_FOUND, StatusCodes.NOT_FOUND);
    }

    await product.remove();
  }

  /**
   * @summary Send receipt of a given products
   */
  @Post('/receipt')
  async receipt(@Request() req: express.Request, @Body() body: ProductReceiptInput): Promise<void> {
    const products = await ProductModel.find({ _id: { $in: uniq(body.productIds) } }).exec();

    const counts: Record<string, number> = {};

    body.productIds.forEach((productId) => {
      counts[String(productId)] = 1 + (counts[productId] || 0);
    });

    let total = 0;
    const _products: Array<ReceiptProduct | undefined> = Object.keys(counts).map((productId) => {
      const product = products.find((product) => product._id === Number(productId));

      if (product) {
        const pro = {
          name: product.name,
          quantity: counts[productId],
          value: counts[productId] * product.price,
        };

        // add to total
        total += pro.value;

        return pro;
      }
    });

    const receipt: ReceiptData = {
      date: moment().format('L, LT'),
      total,
      products: _products.filter((product) => product) as ReceiptProduct[], // remove products not found
    };

    const htmlContent = await parseHTML(receipt);

    const filename = moment().format('YYYY-MM-DDTHHhmm') + '.pdf';
    // get file stream
    const response = await cloxel.nodemium().htmlToPdf(htmlContent, filename);

    // lets just save it locally first
    const tempPDFPath = path.join(process.cwd(), 'receipts');
    const filePath = path.join(tempPDFPath, filename);

    // check if path exists
    if (!(await promisify(exists)(tempPDFPath))) {
      await promisify(mkdir)(tempPDFPath);
    }

    const writeStream = fs.createWriteStream(filePath);

    // pipe data to fs
    const write = response.data.pipe(writeStream);

    await new Promise((resolve, reject) => {
      write.on('error', reject);
      write.on('finish', resolve);
    });

    // read the data piped and send to user
    const readStream = createReadStream(filePath);

    req.res!.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    req.res!.type('pdf');

    // stream the file
    readStream.pipe(req.res!);
    await new Promise<void>((resolve, reject) => {
      readStream.on('end', () => {
        req.res!.end();
        resolve();
      });

      readStream.on('error', reject);
    });
  }
}
