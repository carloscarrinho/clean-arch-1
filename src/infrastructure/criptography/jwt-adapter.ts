import jsonwebtoken from 'jsonwebtoken'
import { Encrypter } from '../../data/protocols/cryptography/encrypter'

export class JwtAdapter implements Encrypter {
  constructor (private readonly secret: string) {}

  async generate (value: string): Promise<string> {
    return jsonwebtoken.sign({ id: value }, this.secret)
  }
}
