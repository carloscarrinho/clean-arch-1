import { ServerError } from '../errors/server-error'
import { HttpResponse } from '../protocols/http'

export const success = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const internalServerError = (): HttpResponse => ({
  statusCode: 500,
  body: new ServerError()
})
