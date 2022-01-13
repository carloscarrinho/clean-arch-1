import { DbAddAccount } from '../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../infrastructure/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infrastructure/db/mongodb/account-repository/account'
import { SignUpController } from '../../presentation/controller/signup/signup-controller'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'

export const makeSignUpController = (): SignUpController => {
  const emailValidator = new EmailValidatorAdapter()

  const salt = 12
  const encrypter = new BcryptAdapter(salt)
  const repository = new AccountMongoRepository()
  const addAccount = new DbAddAccount(encrypter, repository)

  return new SignUpController(emailValidator, addAccount)
}
