The configuration passed to the constructor of *qrs* drives how authentication is handled.

### Typical configurations

**Example using Windows authentication**
(TBD)

**Example using header authentication**

```javascript
var config = {
	authentication: 'header',
	host: 'server.mydomain.com',
	useSSL: true,
	virtualProxy: 'hdr',
	headerKey: 'hdr-usr',
	headerValue: 'mydomain\\justme'
}; 
```

**Example using certificates**

```js
var config = {
	authentication: 'certificates',
	host: 'server.mydomain.com',
	useSSL: true,
	cert: 'C:\\CertStore\\client.pem',
	key: 'C:\\CertStore\\client_key.pem',
	ca: 'C:\\CertStore\\root.pem',
	port: 4242,
	headerKey: 'X-Qlik-User',
	headerValue: 'UserDirectory:Internal;UserId:sa_repository'
};
```

### All options

* **`host`** - Qualified / fully qualified name or IP-address of the server where the Qlik Sense Repository server is running on, defaults to "`127.0.0.1`"
* **`useSSL`** - Whether to use SSL or not, defaults to `false`. 
* **`authentication`** - Authentication method, can be "`windows`", "`certificates`" or "`header`", defaults to "`windows`".
* **`headerKey`** - Header key.
* **`headerValue`** - Header value.
* **`virtualProxy`** - Name of the virtual proxy.
* **`port`** - Port to be used.



