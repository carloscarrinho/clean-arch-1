import { badRequest, internalServerError, success } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse, AddAccount, Validation } from './signup-protocols'

export class SignUpController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly addAccount: AddAccount
  ) {}

  public async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const error = this.validation.validate(httpRequest.body)

    if (error) return badRequest(error)

    try {
      const account = await this.addAccount.add({
        name: httpRequest.body.name,
        email: httpRequest.body.email,
        password: httpRequest.body.password
      })

      return success(account)
    } catch (error) {
      return internalServerError(error)
    }
  }
}
