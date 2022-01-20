import { SignUpController } from './signup-controller'
import { InvalidParamError, MissingParamError } from '../../errors'
import { EmailValidator, AddAccount, AccountModel, AddAccountModel, HttpRequest, Validation } from './signup-protocols'
import { internalServerError } from '../../helpers/http-helper'

// ### SUGESTÃO DO MANGUINHO PARA MOCK DO SYSTEM UNDER TEST ###
const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null
    };
  }
  return new ValidationStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }

      return await new Promise(resolve => resolve(fakeAccount))
    }
  }
  return new AddAccountStub()
}

const makeSut = (): {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
} => {
  const emailValidatorStub = makeEmailValidator()
  const validationStub = makeValidation()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, validationStub, addAccountStub)
  return { sut, emailValidatorStub, addAccountStub }
}

const makeFakeRequest = (data?: object): HttpRequest => {
  return {
    body: {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password',
      passwordConfirmation: 'valid_password',
      ...data
    }
  }
}

// ### ALTERNATIVA DE MOCK DO SYSTEM UNDER TEST ###
// TODO: make method returns 'happy path' by default
const makeSut2 = ({
  isValid,
  add,
  validate
}: {
  isValid?: Function
  add?: Function
  validate?: Function
}): SignUpController => {
  const emailValidatorStub = ({
    isValid: isValid ?? jest.fn().mockReturnValueOnce(true)
  } as unknown) as EmailValidator

  const addAccountStub = ({
    add
  } as unknown) as AddAccount

  const validation = ({
    validate: validate ?? jest.fn().mockResolvedValueOnce(null)
  } as unknown) as Validation

  return new SignUpController(emailValidatorStub, validation, addAccountStub)
}

describe('SignUp Controller', () => {
  it('Should return 400 if no name is provided', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest({ name: null })

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('Should return 400 if no email is provided', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest({ email: null })

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('Should return 400 if no password is provided', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest({ password: null })

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('Should return 400 if no password confirmation is provided', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest({ passwordConfirmation: null })

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  it('Should return 400 if password confirmation fails', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = makeFakeRequest({ passwordConfirmation: 'invalid_password' })

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  it('Should return 400 if an invalid e-mail is provided', async () => {
    // Given
    const { sut, emailValidatorStub } = makeSut()
    // alternativas para mockar o emailValidatorStub:
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    // emailValidatorStub.isValid = () => false

    const httpRequest = makeFakeRequest()

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  it('Should call EmailValidator with e-mail provided by request', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, emailValidatorStub } = makeSut()
    // const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const isValidSpy = jest.fn()
    const sut = makeSut2({ isValid: isValidSpy })

    const httpRequest = makeFakeRequest()

    // When
    await sut.handle(httpRequest)

    // Then
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  it('Should return 500 when EmailValidator throws an exception', async () => {
    // Given
    const { sut, emailValidatorStub } = makeSut()
    // sugestão do Manguinho para mock do método 'isValid' do emailValidatorStub:
    const fakeError = new Error()
    fakeError.stack = 'any_stack'
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw fakeError })
    // alternativa sem utilizar o Jest:
    // emailValidatorStub.isValid = () => { throw new Error() }

    const httpRequest = makeFakeRequest()

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse).toEqual(internalServerError(fakeError))
  })

  it('Should call AddAccount with validated values', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, addAccountStub } = makeSut()
    // const addSpy = jest.spyOn(addAccountStub, 'add')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const addSpy = jest.fn()
    const sut = makeSut2({
      isValid: () => true,
      add: addSpy
    })

    const httpRequest = makeFakeRequest()

    // When
    await sut.handle(httpRequest)

    // Then
    expect(addSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })

  it('Should return 500 when AddAccount throws an exception', async () => {
    // Given
    // sugestão do Manguinho para mock do método 'isValid' do addAccountStub:
    const { sut, addAccountStub } = makeSut()
    const fakeError = new Error()
    fakeError.stack = 'any_error'
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw fakeError })

    // alternativa sem utilizar o Jest:
    // const dependencies = {
    //   isValid: () => true,
    //   add: () => { throw new Error() }
    // }
    // const sut = makeSut2(dependencies)

    const httpRequest = makeFakeRequest()

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse).toEqual(internalServerError(fakeError))
  })

  it('Should return 200 if valid data is provided', async () => {
    // Given
    // sugestão Manguinho:
    const { sut } = makeSut()

    const httpRequest = makeFakeRequest()

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })

  it('Should call AddAccount with validated values', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, addAccountStub } = makeSut()
    // const addSpy = jest.spyOn(addAccountStub, 'add')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const validateSpy = jest.fn()
    const sut = makeSut2({
      isValid: () => true,
      validate: validateSpy
    })

    const httpRequest = makeFakeRequest()

    // When
    await sut.handle(httpRequest)

    // Then
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })
})
