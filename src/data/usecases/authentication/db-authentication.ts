import {
  Authentication,
  AuthenticationModel
} from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly repository: LoadByAccountRepository,
    private readonly hashComparer: HashComparer
  ) {}

  async auth (credentials: AuthenticationModel): Promise<string> {
    const account = await this.repository.load(credentials.email)
    if (!account) return null

    await this.hashComparer.compare(credentials.password, account.password)

    return null
  }
}
