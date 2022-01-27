import {
  Authentication,
  AuthenticationModel
} from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { TokenGenerator } from '../../protocols/cryptography/token-generator'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'
import { UpdateAccessTokenRepository } from '../../protocols/db/update-access-token-repository'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly repository: LoadByAccountRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator,
    private readonly updateAccessTokenRepo: UpdateAccessTokenRepository
  ) {}

  async auth (credentials: AuthenticationModel): Promise<string> {
    const account = await this.repository.load(credentials.email)
    if (!account) return null

    const isValid = await this.hashComparer.compare(
      credentials.password,
      account.password
    )

    if (!isValid) return null

    const token = await this.tokenGenerator.generate(account.id)

    await this.updateAccessTokenRepo.update(account.id, token)

    return token
  }
}
