/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const R = require('ramda');
const prettier = require('prettier');

const tsoa = require(path.resolve('./tsoa.json'));

const map = new Map(tsoa.media_uploads || []);

if (!tsoa.spec.spec) {
  tsoa.spec.spec = {
    paths: {},
  };
}

let change = false;
const paths = {};
for (const [pathName, methodMap] of map.entries()) {
  const path = {};
  const oldPath = tsoa.spec.spec.paths[pathName] || {};

  for (const method of Object.keys(methodMap)) {
    const parameters = [];

    for (const field of methodMap[method].fields) {
      parameters.push({
        in: 'formData',
        name: field.name,
        required: Boolean(field.required),
        schema: {
          type: 'file',
        },
      });
    }

    path[method] = {
      consumes: ['multipart/form-data'],
      parameters,
    };
  }

  // only check once for a change
  if (!change && !R.equals(path, oldPath)) {
    change = true;
  }

  paths[pathName] = path;
}

if (change || !R.equals(Object.keys(paths), Object.keys(tsoa.spec.spec.paths))) {
  tsoa.spec.spec.paths = paths;

  const err = fs.writeFileSync(
    'tsoa.json',
    prettier.format(JSON.stringify(tsoa), { parser: 'json' }),
  );

  if (err) {
    throw err;
  }
}
