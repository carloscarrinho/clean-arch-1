import { Request, Response } from 'express'
import { DbAddAccount } from '../../../data/usecases/add-account/db-add-account'
import { BcryptAdapter } from '../../../infrastructure/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../../infrastructure/db/mongodb/account-repository/account'
import { LogMongoRepository } from '../../../infrastructure/db/mongodb/log-repository/log'
import { SignUpController } from '../../../presentation/controller/signup/signup-controller'
import { Controller, HttpRequest, HttpResponse } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log'
import { makeSignUpValidation } from './signup-validation'

const makeSignUpController = (): Controller => {
  const salt = 12
  const hasher = new BcryptAdapter(salt)
  const repository = new AccountMongoRepository()
  const addAccount = new DbAddAccount(hasher, repository)

  const signUpController = new SignUpController(makeSignUpValidation(), addAccount)
  const logMongoRepository = new LogMongoRepository()

  return new LogControllerDecorator(signUpController, logMongoRepository)
}

export const adaptSignUpController = async (req: Request, res: Response): Promise<Response> => {
  const controller = makeSignUpController()
  const httpRequest: HttpRequest = { body: req.body }
  const httpResponse: HttpResponse = await controller.handle(httpRequest)

  if (httpResponse.statusCode !== 200) {
    return res.status(httpResponse.statusCode).json({ error: httpResponse.body.message })
  }

  return res.status(httpResponse.statusCode).json(httpResponse.body)
}
