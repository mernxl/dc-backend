import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import * as os from 'os';
import path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import { v1 } from 'uuid';

import { config } from './config';

export enum NotifySMSRequestType {
  Flash = 'flash',
  Inbox = 'inbox',
}

export interface NotifySMSSendInput {
  from: string | number;
  to: string | string[];
  message: string;
  type?: NotifySMSRequestType;
}

export interface CloxelNotifyConfig {
  apiUrl: string;
  serviceKey: string;
}

export class CloxelNotify {
  private config: CloxelNotifyConfig;

  constructor(config: CloxelNotifyConfig) {
    this.config = config;
  }

  sendSMS(sendInput: NotifySMSSendInput): Promise<string[]> {
    return axios
      .request<string[]>({
        baseURL: this.config.apiUrl,
        method: 'post',
        url: '/notify/sms',
        headers: { ServiceKey: this.config.serviceKey },
        data: sendInput,
      })
      .then((data) => data.data);
  }
}

export interface CloxelConfig {
  apiUrl: string;
  subscriptionId: string;
  notifyServiceKey: string;
}

export class Cloxel {
  private config: CloxelConfig;

  constructor(config: CloxelConfig) {
    this.config = config;
  }

  notify(): CloxelNotify {
    return new CloxelNotify({
      apiUrl: this.config.apiUrl,
      serviceKey: this.config.notifyServiceKey,
    });
  }

  nodemium(): {
    htmlToPdf(
      urlOrContent: string,
      filename?: string,
      options?: Omit<PDFOptions, 'urlOrContent' | 'fileContent'>,
    ): Promise<AxiosResponse<Readable>>;
  } {
    const baseUrl = this.config.apiUrl.replace('api', 'nodemium');

    return {
      htmlToPdf: async (
        urlOrContent: string,
        filename?: string,
        options: Omit<PDFOptions, 'urlOrContent' | 'fileContent'> = {},
      ): Promise<AxiosResponse<Readable>> => {
        const request: AxiosRequestConfig = {
          baseURL: baseUrl,
          url: '/html-to-pdf',
          method: 'post',
          responseType: 'stream',
        };

        // url
        if (urlOrContent.startsWith('http')) {
          request.data = { filename, urlOrContent, ...options };
        } else {
          const filePath = path.join(os.tmpdir(), v1());
          await promisify(fs.writeFile)(filePath, urlOrContent);

          const formData = new FormData();

          if (filename) {
            formData.append('filename', filename);
          }

          formData.append('urlOrContent', 'fileContent');
          formData.append('fileContent', createReadStream(filePath));

          for (const key of Object.keys(options as any)) {
            formData.append(key, String((options as any)[key]));
          }

          request.data = formData;
          request.headers = formData.getHeaders();
        }

        return axios.request<Readable>(request);
      },
    };
  }
}

const cloxel = new Cloxel(config.cloxel);

export { cloxel };

export type LayoutDimension = string | number;
export type PDFFormat =
  | 'Letter'
  | 'Legal'
  | 'Tabloid'
  | 'Ledger'
  | 'A0'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6';

/**
 * A name to use as the filename for the pdf.
 * @example: invoice-0020.pdf
 * @default: pdf-content.pdf
 */
export type Filename = string;

export interface PDFOptions {
  /**
   * The url to convert or a html content to directly convert to pdf.
   * Internally matches starts with http, to fetch as url
   *
   * if content size too big then use the file upload method, and pass `fileContent` as urlOrContent
   * @example https://www.example.com
   */
  urlOrContent: string;
  /**
   * Actual file you want to upload, consider using a form-data
   */
  fileContent?: any;

  filename?: Filename;
  /**
   * Scale of the webpage rendering.
   * @default 1
   */
  scale?: number;
  /**
   * Display header and footer.
   * You may want to refer here if you face difficulties with displaying the header or footer
   * @see https://stackoverflow.com/a/51462129
   * @default false
   */
  displayHeaderFooter?: boolean;
  /**
   * HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them:
   * - `date` formatted print date
   * - `title` document title
   * - `url` document location
   * - `pageNumber` current page number
   * - `totalPages` total pages in the document
   */
  headerTemplate?: string;
  /**
   * HTML template for the print footer. Should be valid HTML markup with following classes used to inject printing values into them:
   * - `date` formatted print date
   * - `title` document title
   * - `url` document location
   * - `pageNumber` current page number
   * - `totalPages` total pages in the document
   */
  footerTemplate?: string;
  /**
   * Print background graphics.
   * @default false
   */
  printBackground?: boolean;
  /**
   * Paper orientation.
   * @default false
   */
  landscape?: boolean;
  /**
   * Paper ranges to print, e.g., '1-5, 8, 11-13'.
   * defaults to '', which means print all pages.
   */
  pageRanges?: string;
  /**
   * Paper format. If set, takes priority over width or height options.
   * @default Letter
   */
  format?: PDFFormat;
  /** Paper width. */
  width?: LayoutDimension;
  /** Paper height. */
  height?: LayoutDimension;
  /** Paper margins, defaults to none. */
  margin?: {
    /** Top margin. */
    top?: LayoutDimension;
    /** Right margin. */
    right?: LayoutDimension;
    /** Bottom margin. */
    bottom?: LayoutDimension;
    /** Left margin. */
    left?: LayoutDimension;
  };
  /**
   * Give any CSS @page size declared in the page priority over what is declared in width and
   * height or format options.
   *
   * defaults to false which will scale the content to fit the paper size.
   * @default false
   */
  preferCSSPageSize?: boolean;
}
