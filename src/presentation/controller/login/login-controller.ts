import { MissingParamError } from '../../errors'
import { badRequest, success } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoginController implements Controller {
  async handle (request: HttpRequest): Promise<HttpResponse> {
    const requiredFields = ['email', 'password']

    for (const field of requiredFields) {
      if (!request.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    return success(null)
  }
}
