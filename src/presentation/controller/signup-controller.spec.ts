import { SignUpController } from './signup-controller'

describe('SignUp Controller', () => {
  it('Should return 400 if no name is provided', async () => {
    // Given
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'anyemail@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
  })
})
