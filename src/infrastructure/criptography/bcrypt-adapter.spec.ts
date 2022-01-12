import bcrypt from 'bcrypt'
import { Encrypter } from '../../data/protocols/encrypter'
import { BcryptAdapter } from './bcrypt-adapter'

const hashedValue = 'hashed_value'
const valueToHash = 'valid_password'
const salt = 12

jest.mock('bcrypt', () => ({
  async hash (value: string, salt: number): Promise<string> {
    return await new Promise((resolve) => resolve(hashedValue))
  }
}))

const makeSut = (salt?: number): Encrypter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  it('Should call bcrypt with correct values', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    const sut = makeSut(salt)

    await sut.encrypt(valueToHash)

    expect(hashSpy).toHaveBeenCalledWith(valueToHash, salt)
  })

  it('Should return a hash on success', async () => {
    const sut = makeSut(salt)

    const hash = await sut.encrypt(valueToHash)

    expect(hash).toBe(hashedValue)
  })
})
