import bcrypt from 'bcrypt'
import { Encrypter } from '../../data/protocols/cryptography/encrypter'

export class BcryptAdapter implements Encrypter {
  constructor (private readonly salt: number = 12) {}

  public async encrypt (value: string): Promise<string> {
    return await bcrypt.hash(value, this.salt)
  }
}
