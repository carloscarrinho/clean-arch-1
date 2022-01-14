import { SignUpController } from '../../presentation/controller/signup/signup-controller'
import { LogControllerDecorator } from './log'

// ###### MEU MOCK ######
const makeSut = ({ handle }: { handle?: Function}): LogControllerDecorator => {
  const signUpController = ({
    handle: handle ?? jest.fn()
  } as unknown) as SignUpController

  return new LogControllerDecorator(signUpController)
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

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }

    // When
    await sut.handle(httpRequest)

    // Then
    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })
})
