slip.js
=======

slip.js is a library for encoding and decoding [Serial Line Internet Protocol](http://tools.ietf.org/html/rfc1055) packets in JavaScript. It works in both Node.js and in a web browser.

How Do I Use It?
----------------

slip.js provides two pieces of functionality: encoding and decoding messages.

### Encoding

Encoding is stateless and synchronous. `slip.encode()` takes any array-like object containing bytes, such as a Uint8Array, Node.js Buffer, ArrayBuffer, or plain JavaScript Array. It returns a Uint8Array containing the encoded message.

#### Example

<pre><code>
var message = new Uint8Array([99, 97, 116, 33]);
var slipEncoded = slip.encoded(message); // Result is [192, 99, 97, 33, 192].
</pre></code>

### Decoding

Decoding is stateful and asynchronous. You need to instantiate a `slip.Decoder` object, providing a callback that will be invoked whenever a complete message is received. By default, messages are limited to 100 MB in size. You can increase this value by providing a `maxBufferSize` as the second argument to the `Decoder` constructor, specified in bytes.

As incoming SLIP packets are received, `decode()` should be invoked. Whenever the `slip.Decoder` detects the end of an incoming message, it will call its `onMessage` callback. The `onMessage` callback's signature is:

<table>
    <tr>
        <th>Argument</th>
        <th>Type</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>msg</td>
        <td>`Uint8Array`</td>
        <td>The decoded message, with SLIP characters removed.</td>
    </tr>
</table

#### Example

<pre><code>
var onMessage = function (msg) {
    console.log("A SLIP message was received! Here is it: " + msg);
};

var decoder = new slip.Decoder(onMessage, 209715200);
decoder.decode(packet);
decoder.decode(otherPacket);
</pre></code>

License
-------

slip.js was written by Colin Clark and is distributed under the MIT and GPL 3 licenses.
