import {
  Authentication,
  AuthenticationModel
} from '../../../domain/usecases/authentication'
import { LoadByAccountRepository } from '../../protocols/load-by-account-repository'

export class DbAuthentication implements Authentication {
  constructor (private readonly repository: LoadByAccountRepository) {}

  async auth (credentials: AuthenticationModel): Promise<string> {
    await this.repository.load(credentials.email)

    return null
  }
}
