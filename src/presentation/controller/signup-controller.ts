import { InvalidParamError, MissingParamError } from '../errors'
import { badRequest, internalServerError } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse, EmailValidator } from '../protocols'

export class SignUpController implements Controller {
  constructor (private readonly emailValidator: EmailValidator) {}

  public handle (httpRequest: HttpRequest): HttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    try {
      const isValid = this.emailValidator.isValid(httpRequest.body.email)

      if (!isValid) {
        return badRequest(new InvalidParamError('email'))
      }

      return {
        statusCode: 200,
        body: {
          success: true
        }
      }
    } catch (error) {
      return internalServerError()
    }
  }
}
