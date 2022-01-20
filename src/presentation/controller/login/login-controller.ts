import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, internalServerError, success } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'

export class LoginController implements Controller {
  constructor (private readonly emailValidator: EmailValidator) {}

  async handle (req: HttpRequest): Promise<HttpResponse> {
    const requiredFields = ['email', 'password']

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    try {
      const { email } = req.body
      const isValid = this.emailValidator.isValid(email)
      if (!isValid) return badRequest(new InvalidParamError('email'))
      return success(null)
    } catch (error) {
      return internalServerError(error)
    }
  }
}
