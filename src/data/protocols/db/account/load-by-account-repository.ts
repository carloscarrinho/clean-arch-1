import { AccountModel } from '../../../../domain/models/account'

export interface LoadByAccountRepository {
  loadByEmail: (email: string) => Promise<AccountModel>
}
