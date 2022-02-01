import { hash } from 'bcrypt'
import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '../../infrastructure/db/mongodb/helpers/mongo-helper'
import app from '../config/app'

let accountsCollection: Collection

describe('Login Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountsCollection = await MongoHelper.getCollection('accounts')
    await accountsCollection.deleteMany({})
  })

  describe('POST /signup', () => {
    it('Should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Carlos',
          email: 'carlos@mail.com',
          password: '12345',
          passwordConfirmation: '12345'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    it('Should return 200 on login', async () => {
      const password = await hash('123456', 12)

      await accountsCollection.insertOne({
        name: 'Carlos',
        email: 'carlos@mail.com',
        password
      })

      await request(app)
        .post('/api/login')
        .send({
          email: 'carlos@mail.com',
          password: '123456'
        })
        .expect(200)
    })

    it('Should return 401 if credentials do not exist', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'any_mail@mail.com',
          password: 'any_password'
        })
        .expect(401)
    })
  })
})
