# node-transip
Node.JS Promise-based library to communicate with the TransIP API

This library creates a new instance of "TransIP" for you, exposing a few libraries and methods you can use to communicate.

**Currently only the DomainService, HaipService, and some methods of the VpsService are supported**

To start a new TransIP instance:

```js
var TransIP = require('transip');

var transipInstance = new TransIP(login, privateKey);
```

`login` is your TransIP login username. An example of the `privateKey` can be found in `config/data.example.js`.

## Enable the TransIP API

The TransIP API is disabled by default, you will have to enable it manually in the control panel. You can create a private key and whitelist your servers after.

## Running the integration tests

Unfortunately, it's not possible or safe for me to publish my private keys so you can run my tests directly. You'll have to adapt the tests to your environment. I run these tests by hand, for now.

