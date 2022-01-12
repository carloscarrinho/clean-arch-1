import bcrypt from 'bcrypt'
import { Encrypter } from '../../data/protocols/encrypter'
import { BcryptAdapter } from './bcrypt-adapter'

const valueToHash = 'valid_password'
const salt = 12

jest.mock('bcrypt')

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
})
