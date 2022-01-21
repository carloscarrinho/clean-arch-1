import { SignUpController } from './signup-controller'
import { MissingParamError } from '../../errors'
import { AddAccount, AccountModel, AddAccountModel, HttpRequest, Validation } from './signup-protocols'
import { badRequest, internalServerError } from '../../helpers/http-helper'

// ### SUGESTÃO DO MANGUINHO PARA MOCK DO SYSTEM UNDER TEST ###
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
  validationStub: Validation
  addAccountStub: AddAccount
} => {
  const validationStub = makeValidation()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(validationStub, addAccountStub)
  return { sut, validationStub, addAccountStub }
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
  validate,
  add
}: {
  validate?: Function
  add?: Function
}): SignUpController => {
  const addAccountStub = ({
    add
  } as unknown) as AddAccount

  const validation = ({
    validate: validate ?? jest.fn().mockReturnValueOnce(null)
  } as unknown) as Validation

  return new SignUpController(validation, addAccountStub)
}

describe('SignUp Controller', () => {
  it('Should return 400 if Validation returns an error', async () => {
    // Given
    const error = new MissingParamError('email')
    const sut = makeSut2({
      validate: jest.fn().mockReturnValueOnce(error)
    })

    const httpRequest = makeFakeRequest()

    // When
    const httpResponse = await sut.handle(httpRequest)

    // Then
    expect(httpResponse).toEqual(badRequest(error))
  })

  it('Should call AddAccount with validated values', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, addAccountStub } = makeSut()
    // const addSpy = jest.spyOn(addAccountStub, 'add')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const addSpy = jest.fn()
    const sut = makeSut2({ add: addSpy })

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
    const fakeError = new Error()
    fakeError.stack = 'any_error'

    // sugestão do Manguinho para mock do método 'isValid' do addAccountStub:
    // const { sut, addAccountStub } = makeSut()
    // jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw fakeError })

    // alternativa sem utilizar o Jest:
    const dependencies = {
      add: () => { throw new Error() }
    }
    const sut = makeSut2(dependencies)

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
})
