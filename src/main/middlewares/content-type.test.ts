import request from 'supertest'
import app from '../config/app'

describe('Content-Type', () => {
  it('Should return default Content-Type as json', async () => {
    const endpoint = '/test_content_as_json'

    app.get(endpoint, (req, res) => {
      res.send()
    })

    await request(app)
      .get(endpoint)
      .expect('content-type', /json/)
  })

  it('Should return Content-Type as xml as forced', async () => {
    const endpoint = '/test_content_as_xml'

    app.get(endpoint, (req, res) => {
      res.type('xml')
      res.send()
    })

    await request(app)
      .get(endpoint)
      .expect('content-type', /xml/)
  })
})
