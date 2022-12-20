const chai = require('chai')
const chaiAsPromised = require("chai-as-promised")
const Client = require('../src/Client.js')
const Server = require('../src/utils/server.js')

chai.use(chaiAsPromised)
const { expect } = chai

describe('Class Client - Integration Tests', () => {

    describe('Class', () => {
        const host = 'localhost'
        const port = 3000

        const server = new Server()

        before(async () => {
            await server.start(port)
        })


        it('should instanciate', () => {
            expect(new Client()).to.be.ok
        })

        it('should connect', async () => {
            const client = new Client()
            await client.connect(host, port)
            await client.connect(host, port)
            await new Promise(r => { setTimeout(r, 2000) })
        })

        it('should write without problems', async () => {
            const client = new Client()
            await client.connect(host, port)
            await client.write('foo', 'bar')
        })


        it('should write & read without problems', async () => {
            const client = new Client()
            await client.connect(host, port)
            await client.write('foo', 'bar')
            const res = await client.read('foo')
            expect(res).to.equal('bar')
        })
    })

})
