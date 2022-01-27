import {
  Authentication,
  AuthenticationModel
} from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { TokenGenerator } from '../../protocols/cryptography/token-generator'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly repository: LoadByAccountRepository,
    private readonly hashComparer: HashComparer,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async auth (credentials: AuthenticationModel): Promise<string> {
    const account = await this.repository.load(credentials.email)
    if (!account) return null

    const isValid = await this.hashComparer.compare(
      credentials.password,
      account.password
    )

    if (!isValid) return null

    await this.tokenGenerator.generate(account.id)

    return null
  }
}
