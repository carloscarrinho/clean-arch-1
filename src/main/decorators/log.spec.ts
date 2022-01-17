import { LogErrorRepository } from '../../data/protocols/log-error-repository'
import { SignUpController } from '../../presentation/controller/signup/signup-controller'
import { internalServerError, success } from '../../presentation/helpers/http-helper'
import { HttpRequest } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

// ###### MEU MOCK ######
const makeSut = ({
  handle,
  log
}: {
  handle?: Function
  log?: Function
}): LogControllerDecorator => {
  const signUpController = ({
    handle
  } as unknown) as SignUpController

  const logErrorRepository = ({
    log: log ?? jest.fn()
  } as unknown) as LogErrorRepository

  return new LogControllerDecorator(signUpController, logErrorRepository)
}

const defaultAccount = {
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
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

// ##### MANGUINHO MOCK ######
// const makeSut2 = (): {
//   sut: LogControllerDecorator
//   controllerStub: Controller
// } => {
//   class ControllerStub implements Controller {
//     async handle (request: HttpRequest): Promise<HttpResponse> {
//       return await new Promise(resolve => resolve({
//         statusCode: 200,
//         body: {
//           id: 'any_id',
//           name: 'any_name',
//           email: 'any_email@mail.com',
//           password: 'any_password'
//         }
//       }))
//     }
//   }

//   const controllerStub = new ControllerStub()
//   const sut = new LogControllerDecorator(controllerStub)

//   return { sut, controllerStub }
// }

describe('LogControllerDecorator', () => {
  it('Should call handle method of controller with request', async () => {
    // Given
    // MEU MOCK
    const handleSpy = jest.fn()
    const sut = makeSut({ handle: handleSpy })

    // MOCK DO MANGUINHO
    // const { sut, controllerStub } = makeSut2()
    // const handleSpy = jest.spyOn(controllerStub, 'handle')

    const httpRequest = makeFakeRequest()

    // When
    await sut.handle(httpRequest)

    // Then
    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })

  it('Should return the same return of controller', async () => {
    // Given
    const expectedResult = {
      statusCode: 200,
      body: success(defaultAccount)
    }
    const dependencies = {
      handle: jest.fn().mockResolvedValue(expectedResult)
    }
    const sut = makeSut(dependencies)

    const httpRequest = makeFakeRequest()

    // When
    const response = await sut.handle(httpRequest)

    // Then
    expect(response).toStrictEqual(expectedResult)
  })

  it('Should call LogControllerErrorRepository with error if controller returns 500', async () => {
    // Given
    const fakeError = new Error()
    fakeError.stack = 'any_error'

    const dependencies = {
      handle: jest.fn().mockResolvedValue(internalServerError(fakeError)),
      log: jest.fn()
    }

    const sut = makeSut(dependencies)

    const httpRequest = makeFakeRequest()

    // When
    await sut.handle(httpRequest)

    // Then
    expect(dependencies.log).toHaveBeenLastCalledWith(fakeError.stack)
  })
})
