const request = require('supertest');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

const app = require('../../app');

describe('Launches API', () => {
    beforeAll(async () => {
        await mongoConnect();
    })

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe('Test Get /launches', () => {
        test('expect to get response 200 status code...', async () => {
            const response = await request(app).get('/launches')
                .expect(200)
                .expect('Content-Type', /json/)
        })
    })

    describe('Test Post /launches', () => {
        test('expect to get response 201 status code...', async () => {
            const response = request(app)
                .post('/launches')
                .send({
                    mission: 'ZTM Experimental IS1',
                    rocket: 'Explorer IS1',
                    target: 'Kepler-1410 b',
                    launchDate: 'December 17,2030'
                })
                .expect(201)
                .expect('Content-Type', /json/)
        })
    })
})

