import jsonwebtoken from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

jest.mock('jsonwebtoken')

const makeSut = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

const anyValue = 'any_value'
const anyToken = 'any_token'
const secret = 'secret'

describe('Jwt Adapter', () => {
  it('Should call jasonwebtoken.sign with correct values', async () => {
    // Given
    const signSpy = jest.spyOn(jsonwebtoken, 'sign')
    const sut = makeSut()

    // When
    await sut.generate(anyValue)

    // Then
    expect(signSpy).toHaveBeenCalledWith({ id: anyValue }, secret)
  })

  it('Should return a token on sign success', async () => {
    // Given
    jsonwebtoken.sign = jest.fn().mockReturnValueOnce(anyToken)
    const sut = makeSut()

    // When
    const token = await sut.generate(anyValue)

    // Then
    expect(token).toEqual(anyToken)
  })
})
