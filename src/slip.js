/*
 * slip.js: A plain JavaScript SLIP implementation that works in both the browser and Node.js
 *
 * Copyright 2017, Colin Clark
 * Licensed under the MIT and GPL 3 licenses.
 */

/*jshint esversion:6 */
/*jshint node:true */

"use strict";

const END = 192;
const ESC = 219;
const ESC_END = 220;
const ESC_ESC = 221;

export function byteArray (data, offset, length) {
    return data instanceof ArrayBuffer ? new Uint8Array(data, offset, length) : data;
}

export function expandByteArray (arr) {
    var expanded = new Uint8Array(arr.length * 2);
    expanded.set(arr);

    return expanded;
}

export function sliceByteArray (arr, start, end) {
    var sliced = arr.buffer.slice ? arr.buffer.slice(start, end) : arr.subarray(start, end);
    return new Uint8Array(sliced);
}

/**
 * SLIP encodes a byte array.
 *
 * @param {Array-like} data a Uint8Array, Node.js Buffer, ArrayBuffer, or [] containing raw bytes
 * @param {Object} options encoder options
 * @return {Uint8Array} the encoded copy of the data
 */
export function encode (data, o) {
    o = o || {};
    o.bufferPadding = o.bufferPadding || 4; // Will be rounded to the nearest 4 bytes.
    data = byteArray(data, o.offset, o.byteLength);

    var bufLen = (data.length + o.bufferPadding + 3) & ~0x03,
        encoded = new Uint8Array(bufLen),
        j = 1;

    encoded[0] = END;

    for (var i = 0; i < data.length; i++) {
        // We always need enough space for two value bytes plus a trailing END.
        if (j > encoded.length - 3) {
            encoded = expandByteArray(encoded);
        }

        var val = data[i];
        if (val === END) {
            encoded[j++] = ESC;
            val = ESC_END;
        } else if (val === ESC) {
            encoded[j++] = ESC;
            val = ESC_ESC;
        }

        encoded[j++] = val;
    }

    encoded[j] = END;
    return sliceByteArray(encoded, 0, j + 1);
}

/**
 * Creates a new SLIP Decoder.
 * @constructor
 *
 * @param {Function} onMessage a callback function that will be invoked when a message has been fully decoded
 * @param {Number} maxBufferSize the maximum size of a incoming message; larger messages will throw an error
 */
export class Decoder {
    constructor(o) {
        o = typeof o !== "function" ? o || {} : {
            onMessage: o
        };

        this.maxMessageSize = o.maxMessageSize || 10485760; // Defaults to 10 MB.
        this.bufferSize = o.bufferSize || 1024; // Message buffer defaults to 1 KB.
        this.msgBuffer = new Uint8Array(this.bufferSize);
        this.msgBufferIdx = 0;
        this.onMessage = o.onMessage;
        this.onError = o.onError;
        this.escape = false;
    }

    /**
     * Decodes a SLIP data packet.
     * The onMessage callback will be invoked when a complete message has been decoded.
     *
     * @param {Array-like} data an incoming stream of bytes
     */
    decode(data) {
        data = byteArray(data);

        var msg;
        for (var i = 0; i < data.length; i++) {
            var val = data[i];

            if (this.escape) {
                if (val === ESC_ESC) {
                    val = ESC;
                } else if (val === ESC_END) {
                    val = END;
                }
            } else {
                if (val === ESC) {
                    this.escape = true;
                    continue;
                }

                if (val === END) {
                    msg = this.handleEnd();
                    continue;
                }
            }

            var more = this.addByte(val);
            if (!more) {
                this.handleMessageMaxError();
            }
        }

        return msg;
    }

    handleMessageMaxError() {
        if (this.onError) {
            this.onError(this.msgBuffer.subarray(0),
                "The message is too large; the maximum message size is " +
                this.maxMessageSize / 1024 + "KB. Use a larger maxMessageSize if necessary.");
        }

        // Reset everything and carry on.
        this.msgBufferIdx = 0;
        this.escape = false;
    }

    // Unsupported, non-API method.
    addByte(val) {
        if (this.msgBufferIdx > this.msgBuffer.length - 1) {
            this.msgBuffer = expandByteArray(this.msgBuffer);
        }

        this.msgBuffer[this.msgBufferIdx++] = val;
        this.escape = false;

        return this.msgBuffer.length < this.maxMessageSize;
    }

    // Unsupported, non-API method.
    handleEnd() {
        if (this.msgBufferIdx === 0) {
            return; // Toss opening END byte and carry on.
        }

        var msg = sliceByteArray(this.msgBuffer, 0, this.msgBufferIdx);
        if (this.onMessage) {
            this.onMessage(msg);
        }

        // Clear our pointer into the message buffer.
        this.msgBufferIdx = 0;

        return msg;
    }
}


