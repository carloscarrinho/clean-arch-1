import {
  Authentication,
  AuthenticationModel
} from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { Encrypter } from '../../protocols/cryptography/encrypter'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'
import { UpdateAccessTokenRepository } from '../../protocols/db/update-access-token-repository'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly repository: LoadByAccountRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepo: UpdateAccessTokenRepository
  ) {}

  async auth (credentials: AuthenticationModel): Promise<string> {
    const account = await this.repository.loadByEmail(credentials.email)
    if (!account) return null

    const isValid = await this.hashComparer.compare(
      credentials.password,
      account.password
    )

    if (!isValid) return null

    const token = await this.encrypter.generate(account.id)

    await this.updateAccessTokenRepo.updateAccessToken(account.id, token)

    return token
  }
}
