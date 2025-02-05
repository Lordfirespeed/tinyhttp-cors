# corstisol

**CORS header middleware for modern Node.js.**

> :pushpin: This project is a fork of [tinyhttp/cors](https://github.com/tinyhttp/cors), which is a rewrite of [expressjs/cors](https://github.com/expressjs/cors).

[![npm][npm-img]][npm-url]
[![GitHub Workflow Status][gh-actions-img]][github-actions]
[![Coverage][cov-img]][cov-url]

## Install

```sh
pnpm i corstisol
```

## API

```ts
import { cors } from 'corstisol'
```

### `cors(options)`

Returns the CORS middleware with the settings specified in the parameters

#### Options

- `origin`: Can be a string defining the `Access-Control-Allow-Origin` value, a boolean which if set to true sets the header to `'*'`, a Regex type, an array (for multiple origins) or a function which contains the request and response as parameters and must return the value for the `Access-Control-Allow-Origin` header
- `methods`: Array of method names which define the `Access-Control-Allow-Methods` header, default to all the most common methods (`GET`, `HEAD`, `PUT`, `PATCH`, `POST`, `DELETE`)
- `allowedHeaders`: Configures the `Access-Control-Allow-Headers` CORS header. Expects an array (ex: [`'Content-Type'`, `'Authorization'`]).
- `exposedHeaders`: Configures the `Access-Control-Expose-Headers` CORS header. If not specified, no custom headers are exposed
- `credentials`: Configures the `Access-Control-Allow-Credentials` CORS header. Set to true to pass the header, otherwise it is omitted.
- `maxAge`: Configures the `Access-Control-Max-Age` CORS header. Set to an integer to pass the header, otherwise it is omitted.
- `optionsSuccessStatus`: Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
- `preflightContinue`: Set 204 and finish response if `true`, call `next` if false.

The default configuration is:

```json
{
  "origin": "*",
  "methods": ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  "optionsSuccessStatus": 204,
  "preflightContinue": false
}
```

## Example

```ts
import { App } from '@tinyhttp/app'
import { cors } from 'corstisol'

const app = new App()

app
  .use(cors({ origin: 'https://myfantastic.site/' }))
  .options('*', cors())
  .get('/', (req, res) => {
    res.send('The headers contained in my response are defined in the cors middleware')
  })
  .listen(3000)
```

[npm-url]: https://npmjs.com/package/corstisol
[github-actions]: https://github.com/lordfirespeed/corstisol/actions
[gh-actions-img]: https://img.shields.io/github/actions/workflow/status/lordfirespeed/corstisol/ci.yml?style=for-the-badge&logo=github&label=&color=blueviolet
[cov-img]: https://img.shields.io/coveralls/github/Lordfirespeed/corstisol?style=for-the-badge&color=blueviolet
[cov-url]: https://coveralls.io/github/Lordfirespeed/corstisol
[npm-img]: https://img.shields.io/npm/dt/corstisol?style=for-the-badge&color=blueviolet
