import { Request, Response } from 'express'
import { DbAddAccount } from '../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../infrastructure/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infrastructure/db/mongodb/account-repository/account'
import { SignUpController } from '../../presentation/controller/signup/signup-controller'
import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'

const makeSignUpController = (): SignUpController => {
  const emailValidator = new EmailValidatorAdapter()

  const salt = 12
  const encrypter = new BcryptAdapter(salt)
  const repository = new AccountMongoRepository()
  const addAccount = new DbAddAccount(encrypter, repository)

  return new SignUpController(emailValidator, addAccount)
}

export const adaptSignUpController = async (req: Request, res: Response): Promise<Response> => {
  const controller = makeSignUpController()
  const httpRequest: HttpRequest = { body: req.body }
  const httpResponse: HttpResponse = await controller.handle(httpRequest)
  const response = res.status(httpResponse.statusCode).json(httpResponse.body)

  return await new Promise(resolve => resolve(response))
}
