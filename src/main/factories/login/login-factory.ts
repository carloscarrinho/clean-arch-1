import { Request, Response } from 'express'
import env from '../../config/env'
import { DbAuthentication } from '../../../data/usecases/authentication/db-authentication'
import { BcryptAdapter } from '../../../infrastructure/criptography/bcrypt-adapter'
import { JwtAdapter } from '../../../infrastructure/criptography/jwt-adapter'
import { AccountMongoRepository } from '../../../infrastructure/db/mongodb/account/account-mongo-repository'
import { LogMongoRepository } from '../../../infrastructure/db/mongodb/log/log-repository'
import { LoginController } from '../../../presentation/controller/login/login-controller'
import { Controller, HttpRequest, HttpResponse } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { makeLoginValidation } from './login-validation-factory'

const makeLoginController = (): Controller => {
  const accountMongoRepo = new AccountMongoRepository()
  const hasherComparer = new BcryptAdapter(12)
  const encrypter = new JwtAdapter(env.secret)
  const dbAuthentication = new DbAuthentication(accountMongoRepo, hasherComparer, encrypter, accountMongoRepo)

  const loginController = new LoginController(makeLoginValidation(), dbAuthentication)
  const logMongoRepository = new LogMongoRepository()

  return new LogControllerDecorator(loginController, logMongoRepository)
}

export const adaptLoginController = async (req: Request, res: Response): Promise<Response> => {
  const controller = makeLoginController()
  const httpRequest: HttpRequest = { body: req.body }
  const httpResponse: HttpResponse = await controller.handle(httpRequest)

  if (httpResponse.statusCode !== 200) {
    return res.status(httpResponse.statusCode).json({ error: httpResponse.body.message })
  }

  return res.status(httpResponse.statusCode).json(httpResponse.body)
}
