const chai = require('chai')
const chaiAsPromised = require("chai-as-promised")
const Client = require('../src/Client.js')
const Server = require('../src/utils/server.js')

chai.use(chaiAsPromised)
const { expect } = chai

describe('Class Client - Unit Tests', () => {


    describe('Class', () => {
        const host = 'localhost'
        const port = 9000

        // it('should instanciate', () => {
        //     expect(new Client()).to.be.ok
        // })

        // it('should connect', (done) => {
        //     const client = new Client()
        //     client.on('connect', done)
        //     client.connect(host, port)
        // })
    })
})
