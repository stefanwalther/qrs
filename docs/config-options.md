The configuration passed to the constructor of *qrs* drives how authentication is handled.

### Typical configurations

**Example using Windows authentication**
(TBD)

**Example using header authentication**

```javascript
var config = {
	server: 'server.mydomain.com',
	isSSL: true,
	authentication: 'header',
	virtualProxy: 'hdr',
	headerKey: 'hdr-usr',
	headerValue: 'mydomain\justme'
}; 
```

**Example using certificates**

```js
var config = {
	server: 'server.mydomain.com',
	isSSL: true,
	authentication: 'certificates',
	cert: 'C:\\CertStore\\client.pem',
	key: 'C:\\CertStore\\client_key.pem',
	ca: 'C:\\CertStore\\root.pem',
	port: 4242,
	headerKey: 'X-Qlik-User',
	headerValue: 'UserDirectory:Internal;UserId:sa_repository'
};
```

**Example using windows authentication**

### All options

* **`server`** - Fully qualified name or IP-address of the server where the Qlik Sense Repository server is running on, defaults to "`127.0.0.1`"
* **`isSSL`** - Whether to use SSL or not, defaults to `false`. 
* **`authentication`** - Authentication method, can be "`windows`", "`certificates`" or "`header`", defaults to "`windows`".
* **`headerKey`** - 
* **`headerValue`** - 
* **`virtualProxy`** - Name of the virtual proxy.
* **`port`** - Port to be used.



