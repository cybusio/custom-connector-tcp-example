const { VrpcAdapter } = require('vrpc')
const Connection = require('./CustomConnection')
const Endpoint = require('./CustomEndpoint')

VrpcAdapter.register(Endpoint, { schema: Endpoint.getSchema() })
VrpcAdapter.register(Connection, { schema: Connection.getSchema() })