// load Util class
import axios from 'axios';
import Util from './util';
const rp = require('request-promise');
/**
 * Qiniu module to implement all apis.
 */
export default class Qiniu {
    static buckets(ak, sk) {
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        const requestURI = 'http://rs.qbox.me/buckets';
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);

        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };

        return rp(options);
    }

    static list(ak, sk, bucket, marker = '', prefix = '', limit = 100) {
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        const requestURI = `http://rsf.qbox.me/list?bucket=${bucket}&limit=100&marker=${marker}&prefix=${prefix}`;
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);

        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };

        return rp(options);
    }

    static domain(ak, sk, bucket) {
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        const requestURI = `http://api.qiniu.com/v6/domain/list?tbl=${bucket}`;
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);

        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };

        return rp(options);
    }

    static delete(ak, sk, bucket, key) {
        const entry = `${bucket}:${key}`;
        const encodedEntryURI = Util.urlsafeBase64Encode(entry);
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        const requestURI = `http://rs.qiniu.com/delete/${encodedEntryURI}`;
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);
        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };

        return rp(options);
    }

    static getUploadOption() {
        
    }

    static createBucket(ak, sk, bucket, region) {
        let encodedBucketName = Util.urlsafeBase64Encode(bucket);
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        region = region ? 'region/' + region : '';
        const requestURI = `http://rs.qiniu.com/mkbucketv2/${encodedBucketName}/${region}`;
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);
        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };
        return rp(options);
    }    

    static removeBucket(ak, sk, bucket) {
        console.log(bucket)
        const mac = {
            accessKey: ak,
            secretKey: sk,
        };
        const requestURI = `http://rs.qiniu.com/drop/${bucket}`;
        const reqBody = '';
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody);
        const options = {
            uri: requestURI,
            headers: {
                Authorization: accessToken,
            },
            json: true,
        };
        return rp(options);
    }
}