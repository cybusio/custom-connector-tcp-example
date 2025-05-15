const Endpoint = require('Endpoint')
const schema = require('./CustomEndpoint.json')

class CustomEndpoint extends Endpoint {
    static getSchema() {
        return Object.assign(super.getSchema(), schema)
    }
}

module.exports = CustomEndpoint
