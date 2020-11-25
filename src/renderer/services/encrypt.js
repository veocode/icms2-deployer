const crypto = require('crypto');
const getFingerprint = require('hw-fingerprint').getFingerprint;

class EncryptService {

    algorithm = 'aes-256-cbc';
    key;
    iv;

    init(callback) {
        const service = this;
        getFingerprint().then(function (fingerPrint) {
            service.key = fingerPrint.toString("hex", 0, 16);
            service.iv = crypto.createHash('md5').update(service.key).digest().toString("hex", 0, 8);
            console.log('KEY', service.key);
            console.log('IV', service.iv);
            if (callback) { callback(); }
        })
    }

    encrypt(text) {
        let cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    }

    decrypt(text) {
        let encryptedText = Buffer.from(text, 'hex');
        let decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), this.iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

}

module.exports = new EncryptService();
