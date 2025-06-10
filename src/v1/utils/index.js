'use strict'

const _ = require('lodash');
const crypto = require('crypto');

const getInfoData = ({fields=[],object={} }) => {
        return _.pick(object, fields);
    }

// create privateKey, publicKey
const createKeyPair = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Key size
        publicKeyEncoding: {
            type: 'spki', // Recommended for public keys
            format: 'pem' // PEM format
        },
        privateKeyEncoding: {
            type: 'pkcs8', // Recommended for private keys
            format: 'pem' // PEM format
        }
    });
    return { publicKey, privateKey };
}
module.exports = {
    getInfoData,
    createKeyPair
}