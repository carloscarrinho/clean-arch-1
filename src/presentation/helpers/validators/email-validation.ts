import { InvalidParamError } from '../../errors'
import { EmailValidator } from '../../protocols/email-validator'
import { Validation } from '../../protocols/validation'

export class EmailValidation implements Validation {
  constructor (
    private readonly fieldName: string,
    private readonly validator: EmailValidator
  ) {}

  validate (input: any): Error {
    const isValid = this.validator.isValid(input[this.fieldName])
    if (!isValid) return new InvalidParamError(this.fieldName)
  }
}
