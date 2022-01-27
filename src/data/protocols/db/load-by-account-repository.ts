import { AccountModel } from '../../../domain/models/account'

export interface LoadByAccountRepository {
  load: (email: string) => Promise<AccountModel>
}
