import bcrypt from 'bcrypt'
import { BcryptAdapter } from './bcrypt-adapter'

const hashedValue = 'hashed_value'
const valueToHash = 'valid_password'
const salt = 12

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise((resolve) => resolve(hashedValue))
  },
  async compare (): Promise<boolean> {
    return await new Promise((resolve) => resolve(true))
  }
}))

const makeSut = (salt?: number): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  describe('hash()', () => {
    it('Should call bcrypt.hash with correct values', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash')
      const sut = makeSut(salt)

      await sut.hash(valueToHash)

      expect(hashSpy).toHaveBeenCalledWith(valueToHash, salt)
    })

    it('Should return a hash on success', async () => {
      const sut = makeSut()

      const hash = await sut.hash(valueToHash)

      expect(hash).toBe(hashedValue)
    })
  })

  describe('compare', () => {
    it('Should call bcrypt.compare with correct values', async () => {
      const compareSpy = jest.spyOn(bcrypt, 'compare')
      const parameters = { value: 'any_value', hash: 'any_hash' }
      const sut = makeSut(salt)

      await sut.compare(parameters.value, parameters.hash)

      expect(compareSpy).toHaveBeenCalledWith(parameters.value, parameters.hash)
    })

    it('Should return true if comparation succeeds', async () => {
      jest.spyOn(bcrypt, 'compare')
      const parameters = { value: 'any_value', hash: 'any_hash' }
      const sut = makeSut(salt)

      const result = await sut.compare(parameters.value, parameters.hash)

      expect(result).toBeTruthy()
    })
  })

  it('Should throw an error if bcrypt throws', async () => {
    bcrypt.hash = jest.fn().mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const sut = makeSut(salt)

    const promise = sut.hash(valueToHash)

    await expect(promise).rejects.toThrow()
  })
})
