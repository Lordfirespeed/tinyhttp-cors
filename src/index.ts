import type { IncomingMessage as Request, ServerResponse as Response } from "node:http"
import { vary } from "@tinyhttp/vary"

export type AccessControlOptions = {
  origin?: string | boolean | ((req: Request, res: Response) => string) | Iterable<string> | RegExp
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  optionsSuccessStatus?: number
  preflightContinue?: boolean
}

function isObjectOrArray(obj: unknown): obj is Record<string | number | symbol, unknown> {
  if (obj === null) return false
  return typeof obj === "object"
}

function isIterable(obj: unknown): obj is Iterable<unknown> {
  if (!isObjectOrArray(obj)) return false
  return typeof obj[Symbol.iterator] === "function"
}

function getOriginHeaderHandler(origin: unknown): (req: Request, res: Response) => void {
  function fail(): never {
    throw new TypeError("No other objects allowed. Allowed types is array of strings or RegExp")
  }

  if (typeof origin === "boolean" && origin === true) {
    return (_, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*")
    }
  }

  if (typeof origin === "boolean" && origin === false) {
    return () => undefined
  }

  if (typeof origin === "string") {
    return (_, res) => {
      res.setHeader("Access-Control-Allow-Origin", origin)
    }
  }

  if (typeof origin === "function") {
    return (req, res) => {
      vary(res, "Origin")
      res.setHeader("Access-Control-Allow-Origin", origin(req, res))
    }
  }

  if (typeof origin !== "object") fail()

  if (isIterable(origin)) {
    const originArray = Array.from(origin)
    if (originArray.some((element) => typeof element !== "string")) fail()

    const originSet = new Set(origin)

    if (originSet.has("*")) {
      return (_, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*")
      }
    }

    return (req, res) => {
      vary(res, "Origin")
      if (req.headers.origin === undefined) return
      if (!originSet.has(req.headers.origin)) return
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    }
  }

  if (origin instanceof RegExp) {
    return (req, res) => {
      vary(res, "Origin")
      if (req.headers.origin === undefined) return
      if (!origin.test(req.headers.origin)) return
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    }
  }

  fail()
}

/**
 * CORS Middleware
 */
export function cors(opts: AccessControlOptions = {}) {
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders = ["content-type"],
    exposedHeaders,
    credentials,
    maxAge,
    optionsSuccessStatus = 204,
    preflightContinue = false,
  } = opts
  const originHeaderHandler = getOriginHeaderHandler(origin)

  return (req: Request, res: Response, next?: () => void): void => {
    originHeaderHandler(req, res)

    // Setting the Access-Control-Allow-Methods header from the methods array
    res.setHeader("Access-Control-Allow-Methods", methods.join(", ").toUpperCase())

    // Setting the Access-Control-Allow-Headers header
    if (allowedHeaders) res.setHeader("Access-Control-Allow-Headers", allowedHeaders)

    // Setting the Access-Control-Expose-Headers header
    if (exposedHeaders) res.setHeader("Access-Control-Expose-Headers", exposedHeaders)

    // Setting the Access-Control-Allow-Credentials header
    if (credentials) res.setHeader("Access-Control-Allow-Credentials", "true")

    // Setting the Access-Control-Max-Age header
    if (maxAge) res.setHeader("Access-Control-Max-Age", maxAge)

    if (req.method?.toUpperCase?.() === "OPTIONS") {
      if (preflightContinue) {
        next?.()
      } else {
        res.statusCode = optionsSuccessStatus
        res.setHeader("Content-Length", "0")
        res.end()
      }
    } else {
      next?.()
    }
  }
}
