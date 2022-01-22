import { badRequest, internalServerError, success, unauthorized } from '../../helpers/http/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { Authentication } from '../../../domain/usecases/authentication'
import { Validation } from '../signup/signup-protocols'

export class LoginController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly authentication: Authentication
  ) {}

  async handle (req: HttpRequest): Promise<HttpResponse> {
    const error = this.validation.validate(req.body)
    if (error) return badRequest(error)

    try {
      const { email, password } = req.body
      const accessToken = await this.authentication.auth(email, password)
      if (!accessToken) return unauthorized()

      return success(accessToken)
    } catch (error) {
      return internalServerError(error)
    }
  }
}
