const { EventEmitter } = require('events')
const net = require("net")
const PromiseStore = require('promise-store-js') // https://www.npmjs.com/package/promise-store-js

// Constant Protocol Tags
const TAGS = {
    START: '<START>',
    END: '<END>'
}
class TCPClient extends EventEmitter {
    constructor(parameters) {
        super()

        this._timeout = 6000
        this._store = new PromiseStore({ timeout: this._timeout })
        this._client = new net.Socket()
        this._inBuffer = '' // Input buffer

        this._client // Client socket
            .on('connect', () => { this._store.resolve(/connect/) }) // Resolve connection
            .on('error', (err) => { this.emit('error', err) }) // (Re)emit error
            .on('close', (hadError) => { this.emit('close', hadError) })
            .on('data', (data) => {
                try {
                    this._handleData(data) // Handle input data
                } catch (err) {
                    this.emit('error', err)
                }
            })
    }

    async connect(host, port) {
        const promise = this._store.create('connect')
        this._client.connect({ host, port })
        return promise
    }

    end() {
        this._client.destroy()
    }

    async read(address) {
        const promise = this._store.create(`READ:${address}`) // Create promise to be resolved
        this._client.write(`${TAGS.START}READ:${address}${TAGS.END}`) // Send request
        return promise
    }

    async write(address, data) {
        const promise = this._store.create(`WRITE:${address}`) // Create promise to be resolved
        this._client.write(`${TAGS.START}WRITE:${address}:${data}${TAGS.END}`) // Send request
        return promise
    }

    _handleData(data) {
        this._inBuffer += data.toString() // Append input buffer

        const content = this._inBuffer

        // Search for start
        const start = content.indexOf(TAGS.START)
        if (start < 0) return null

        // Search for end
        const end = content.indexOf(TAGS.END)
        if (end < 0) return null

        // remove message from buffer
        this._inBuffer = this._inBuffer.substring(end + TAGS.END.length)

        // Recursive call, because we may have received more then one message
        if (this._inBuffer.length > 0) _handleData()

        // Extarct content
        const payload = content.substring(start + TAGS.START.length, end)

        // Get message parts
        const parts = payload.split(':')
        if (parts.length <= 0) return null

        // Handle Data
        let address = null
        switch (parts[0]) {
            case 'SUCCESS':
                if (parts.length < 2) throw new Error(`Unexpected number of arguments (P001)`)

                switch (parts[1]) {
                    case 'WRITE':
                        if (parts.length < 3) throw new Error(`Unexpected number of arguments (P002)`)
                        this._store.resolve(new RegExp(`WRITE:${parts[2]}`), 'success') // Fulfill promise
                        break;

                    case 'READ':
                        if (parts.length < 4) throw new Error(`Unexpected number of arguments (P003)`)
                        this._store.resolve(new RegExp(`READ:${parts[2]}`), parts[3]) // Fulfill promise
                        break;

                    default:
                        throw new Error(`Unexpected opperation (P001)`)
                }

                break;

            default:
                throw new Error(`Unexpected opperation (P002)`)
        }
    }
}

module.exports = TCPClient