import bcrypt from 'bcrypt'
import { Hasher } from '../../data/protocols/cryptography/hasher'

export class BcryptAdapter implements Hasher {
  constructor (private readonly salt: number = 12) {}

  public async hash (value: string): Promise<string> {
    return await bcrypt.hash(value, this.salt)
  }
}
