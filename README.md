# rancher-node
Node client for the Rancher API

## Client

An API client is included in this package

```js
const Rancher = require('rancher-node');

const client = new Rancher.Client({ url: 'https://try.rancher.com/v2-beta/projects/XXXXXXXX/' access_key: 'SoMeToKeN', secret_key: 'someSecRetToken' });

client.getContainer(containerId).then((container) => {
  // gets the container for the provided container id
}).catch((err)=>{
  console.error(' ERROR : ', err)
});
```

Many methods are available, until they're documented see [lib/index.js](lib/index.js) for details.
