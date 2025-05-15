# Custom Connector Example

This is a sample implementation of a Custom Connector for [Cybus Connectware](https://www.cybus.io/produkt/cybus-connectware/), embedded in a so called Cybus Connectware [Agent](https://docs.cybus.io/latest/user/agents.html). You can read more about Cybus Connectware Agents [here](https://docs.cybus.io/documentation/agents).

## Content

This repository includes the following content:
- Server implementation `src/utils/server.js`
- Client implementation `src/*.js`
- Playground environment `docker-compose.yaml`
- Example [Service Commissioning File](https://docs.cybus.io/documentation/services/service-commissioning-files#structure-of-service-commissioning-files) `examples/service.yaml`

## How to build

Since a Custom Connector is based on a pre-built Docker image, the image tag version has to be passed to the build command. 
This tag version equals to the Connectware version this Custom Connector should be connected to, for instance:

```shell
 docker compose build --build-arg BASEIMAGE_VERSION=1.1.1
```

## How to run

To start the Agent along with a sample server, adjust the playground environment `docker-compose.yaml` and execute it.


```shell
 docker compose up
```

Follow the usual Agent Registration Process and install the attached example [Service Commissioning File](https://docs.cybus.io/documentation/services/service-commissioning-files#structure-of-service-commissioning-files) `examples/service.yaml`.

If everything goes right, you should now be able to observe an empty string being published to the MQTT topic `services/mycustomprotocolservice/mySubscribeEndpoint/foo`.

For a write operation, simply publish a string to the MQTT topic `services/mycustomprotocolservice/myWriteEndpoint/foo/set`

## Sample Protocol Specification

There are two supported operations `WRITE` and `read`. The argument separator is a simple colon `:`.

### Write Operation
Request:
```
<START>WRITE:<ADDRESS>:<VALUE><END> // Example: <START>WRITE:foo:bar<END>
```
Response:
```
<START>SUCCESS:WRITE:<ADDRESS><END> // Example: <START>SUCCESS:WRITE:foo<END>
```
### Read Operation
Request:
```
<START>READ:<ADDRESS><END> // Example: <START>READ:foo<END>
```
Response:
```
<START>SUCCESS:READ:<ADDRESS>:<VALUE><END> // Example: <START>SUCCESS:READ:foo:bar<END>
```
