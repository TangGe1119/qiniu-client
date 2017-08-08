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
}