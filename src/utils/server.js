const net = require("net")
const PromiseStore = require('promise-store-js') // https://www.npmjs.com/package/promise-store-js

// Constant Protocol Tags
const TAGS = {
    START: '<START>',
    END: '<END>'
}

class Server {
    constructor() {
        this.mem = new Map() // In memory key value storage
        this.buffer = new Map() // Per Client input buffer
        this.store = new PromiseStore()

        this.socket = new net.Socket()
        this.server = net.createServer(this.socket)
            .on('listening', () => { this.store.resolve(/start/, 'listening on port 9000') })
            .on('connection', this._handleConnection)
            .on('close', () => { this.store.resolve(/close/, 'closed') })
    }

    async start(port = 9000) {
        const promise = this.store.create('start')
        this.server.listen(port)
        return promise
    }

    async stop() {
        const promise = this.store.create('close')
        this.server.close()
        return promise
    }

    // Handle client connections
    _handleConnection = (socket) => {
        const id = `${socket.remoteAddress}:${socket.remotePort}` // Generate unique client id for input buffering
        this.buffer.set(id, '') // Create the input buffer

        socket // Client socket
            .on('close', () => {
                if (this.buffer.has(id)) this.buffer.delete(id) // Delete input buffer on connection close
            })
            .on('data', data => {
                const inData = data.toString()
                this.buffer.set(id, this.buffer.get(id) + inData) // Append input buffer
                const res = this._handleBuffer(id) // Handle message
                if (res) socket.write(res) // Eventually return response
            })
    }

    _handleBuffer = (key) => {
        const content = this.buffer.get(key)

        // Search for start
        const start = content.indexOf(TAGS.START)
        if (start < 0) return null

        // Search for end
        const end = content.indexOf(TAGS.END)
        if (end < 0) return null

        // remove message from buffer
        this.buffer.set(key, this.buffer.get(key).substring(end + TAGS.END.length))

        // Recursive call, because we may have received more then one message
        if (this.buffer.get(key).length > 0) _handleBuffer(key)

        // Extarct content
        const payload = content.substring(start + TAGS.START.length, end)

        // Get message parts
        const parts = payload.split(':')
        if (parts.length <= 0) return null

        // Handle Data
        let address = null
        switch (parts[0]) {
            case 'WRITE':
                // We expect message to have three args (OPERATION=WRITE|ADDRESS|VALUE)
                if (parts.length !== 3) return null

                // Address should have at least a length of one
                address = parts[1]
                if (address.length < 1) return null

                this.mem.set(address, parts[2]) // Store value in memory
                return `${TAGS.START}SUCCESS:WRITE:${address}${TAGS.END}`

            case 'READ':
                // We expect message to have two args (OPERATION=READ|ADDRESS)
                if (parts.length !== 2) return null

                // Address shoul have at least a length of one
                address = parts[1]
                if (address.length < 1) return null

                const value = this.mem.get(address) ?? ''
                return `${TAGS.START}SUCCESS:READ:${address}:${value}${TAGS.END}`

            default:
                return null
        }
    }
}

module.exports = Server