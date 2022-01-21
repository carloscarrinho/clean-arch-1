import { makeSignUpValidation } from './signup-validation'
import { ValidationComposite } from '../../presentation/helpers/validators/validation-composite'
import { RequiredFieldsValidation } from '../../presentation/helpers/validators/required-fields-validation'
import { CompareFieldsValidation } from '../../presentation/helpers/validators/compare-fields-validation'
import { EmailValidation } from '../../presentation/helpers/validators/email-validation'
import { EmailValidator } from '../../presentation/protocols/email-validator'
import { HttpRequest } from '../../presentation/protocols'
import { InvalidParamError, MissingParamError } from '../../presentation/errors'

jest.mock('../../presentation/helpers/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeFakeRequest = (data?: object): HttpRequest => {
  return {
    body: {
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
      passwordConfirmation: 'any_password',
      ...data
    }
  }
}

const createRequiredFieldsValidationInstance = (field: string): RequiredFieldsValidation => {
  return new RequiredFieldsValidation(field)
}

describe('SignUpValidation Factory', () => {
  describe('ValidationComposite', () => {
    it('Should call ValidationComposite with all validators', async () => {
      // Given
      const emailValidator = makeEmailValidator()

      // When
      makeSignUpValidation()

      // Then
      expect(ValidationComposite).toHaveBeenCalledWith([
        new RequiredFieldsValidation('name'),
        new RequiredFieldsValidation('email'),
        new RequiredFieldsValidation('password'),
        new RequiredFieldsValidation('passwordConfirmation'),
        new CompareFieldsValidation('password', 'passwordConfirmation'),
        new EmailValidation('email', emailValidator)
      ])
    })
  })

  describe('RequiredFieldsValidation', () => {
    it('Should return missing param error if no name is provided', async () => {
      // Given
      const sut = createRequiredFieldsValidationInstance('name')
      const request = makeFakeRequest()
      delete request.body.name

      const expectedResult = new MissingParamError('name')

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(expectedResult)
    })

    it('Should return missing param error if no email is provided', async () => {
      // Given
      const sut = createRequiredFieldsValidationInstance('email')
      const request = makeFakeRequest()
      delete request.body.email

      const expectedResult = new MissingParamError('email')

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(expectedResult)
    })

    it('Should return missing param error if no password is provided', async () => {
      // Given
      const sut = createRequiredFieldsValidationInstance('password')
      const request = makeFakeRequest()
      delete request.body.password

      const expectedResult = new MissingParamError('password')

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(expectedResult)
    })

    it('Should return missing param error if no passwordConfirmation is provided', async () => {
      // Given
      const sut = createRequiredFieldsValidationInstance('passwordConfirmation')
      const request = makeFakeRequest()
      delete request.body.passwordConfirmation

      const expectedResult = new MissingParamError('passwordConfirmation')

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(expectedResult)
    })
  })

  describe('CompareFieldsValidation', () => {
    it('Should return invalid param error if password and passwordConfirmation fields do not match', async () => {
      // Given
      const sut = new CompareFieldsValidation('password', 'passwordConfirmation')
      const request = makeFakeRequest({
        passwordConfirmation: 'different_password'
      })

      const expectedResult = new InvalidParamError('passwordConfirmation')

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(expectedResult)
    })
  })

  describe('EmailValidation', () => {
    it('Should call EmailValidator with correct value', async () => {
      // Given
      const emailValidatorStub = makeEmailValidator()
      emailValidatorStub.isValid = jest.fn()

      const sut = new EmailValidation('email', emailValidatorStub)
      const request = makeFakeRequest()

      // When
      sut.validate(request.body)

      // Then
      expect(emailValidatorStub.isValid).toHaveBeenCalledWith(request.body.email)
    })

    it('Should return invalid param error if e-mail is invalid', async () => {
      // Given
      const emailValidatorStub = makeEmailValidator()
      emailValidatorStub.isValid = jest.fn().mockReturnValueOnce(false)

      const sut = new EmailValidation('email', emailValidatorStub)
      const request = makeFakeRequest()

      // When
      const error = sut.validate(request.body)

      // Then
      expect(error).toEqual(new InvalidParamError('email'))
    })

    it('Should throw an error if EmailValidator throws', async () => {
      // Given
      const emailValidatorStub = makeEmailValidator()
      emailValidatorStub.isValid = jest.fn().mockImplementation(() => { throw new Error() })

      const sut = new EmailValidation('email', emailValidatorStub)

      // Then
      expect(sut.validate).toThrow()
    })
  })
})
