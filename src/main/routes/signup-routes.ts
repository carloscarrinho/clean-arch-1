/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { adaptSignUpController } from '../factories/signup/signup-factory'

export default async (router: Router): Promise<void> => {
  router.post('/signup', adaptSignUpController)
}
