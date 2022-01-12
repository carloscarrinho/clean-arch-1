import bcrypt from 'bcrypt'
import { Encrypter } from '../../data/protocols/encrypter'
import { BcryptAdapter } from './bcrypt-adapter'

const hashedValue = 'hashed_value'
const valueToHash = 'valid_password'
const salt = 12

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
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

  it('Should throw an error if bcrypt throws', async () => {
    bcrypt.hash = jest.fn().mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const sut = makeSut(salt)

    const promise = sut.encrypt(valueToHash)

    await expect(promise).rejects.toThrow()
  })
})
