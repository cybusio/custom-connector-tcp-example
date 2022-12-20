const Endpoint = require('Endpoint')
const schema = require('./CustomEndpoint.json')

class CustomEndpoint extends Endpoint {
    static getSchema() {
        return Object.assign(super.getSchema(), schema)
    }

    constructor(options) {
        super(options)
        this._topic = options.address.address // Create the Endpoint MQTT topic
    }

    _getTopic() {
        return this._topic
    }
}

module.exports = CustomEndpoint
