import bcrypt from 'bcrypt'
import { Encrypter } from '../../data/protocols/encrypter'

export class BcryptAdapter implements Encrypter {
  constructor (private readonly salt: number = 12) {}

  public async encrypt (value: string): Promise<string> {
    await bcrypt.hash(value, this.salt)

    return await new Promise(resolve => resolve('hashed_value'))
  }
}
