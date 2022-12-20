const Connection = require('Connection')
const Client = require('./Client.js')
const schema = require('./CustomConnection.json');

class CustomConnection extends Connection {
    constructor(params) {
        super(params)

        this._host = params.connection.host
        this._port = params.connection.port

        this._client = new Client()
        this._client
            .on('error', err => { console.log('err:', err.message) })
            .on('close', this._onClose.bind(this))
    }

    // Protocol implementation interface method
    static getCustomSchema() {
        return { ...schema };
    }

    // Protocol implementation interface method
    async handleConnect() {
        await this._createConnection();
    }

    // Protocol implementation interface method
    async handleReconnect() {
        await this._closeConnection()
        await this._createConnection()
    }

    // Protocol implementation interface method
    async handleDisconnect() {
        await this._closeConnection()
    }

    // Protocol implementation interface method (called for READ and SUBSCRIBE Endpoints)
    async handleRead(address, requestData = {}) {
        const data = await this._client.read(address.address)
        return data
    }

    // Protocol implementation interface method (called for WRITE Endpoints)
    async handleWrite(address, writeData) {
        const data = await this._client.write(address.address, writeData)
        return data
    }

    async _createConnection() {
        try {
            await this._client.connect(this._host, this._port)
        } catch (err) {
            switch (this.getState()) {
                case 'connecting':
                    this.connectFailed(err.message)
                    break
                case 'reconnecting':
                    this.reconnectFailed(err.message)
                    break
            }
            return
        }

        this.connectDone()
    }

    async _closeConnection() {
        this._client.end()

        if (this.getState() === 'disconnecting') {
            this.disconnectDone()
        }
    }

    _onClose() {
        if (this.getState() === 'connected') this.connectLost()
    }
}

module.exports = CustomConnection