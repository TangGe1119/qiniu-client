import Util from './util'
import request from './request'
import config from '../common/config'

export default class Qiniu {
    /**
     * auto get the bucket zone
     * @param ak       accessKey
     * @param bucket   bucket name
     */
    static autoZone(ak, bucket) {
        const requestURI = `https://uc.qbox.me/v2/query?ak=${ak}&bucket=${bucket}`
        const config = {
            url: requestURI
        }
        return request(config)
    }

    /**
     * get all buckets by ak and sk
     * @static
     * @param {string} ak
     * @param {string} sk
     * @returns {Promise}
     * @memberof Qiniu
     */
    static buckets(ak, sk) {
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        const requestURI = 'http://rs.qbox.me/buckets'
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)

        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }
        return request(config)
    }

    /**
     * get list in current bucket
     * @static
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @param {string} [marker='']
     * @param {string} [prefix='']
     * @param {number} [limit=100]
     * @returns {Promise}
     * @memberof Qiniu
     */
    static list(ak, sk, bucket, marker = '', prefix = '', limit = 10000) {
        const mac = {
            accessKey: ak,
            secretKey: sk
        }

        const requestURI = `http://rsf.qbox.me/list?bucket=${bucket}&limit=100&marker=${marker}&prefix=${encodeURIComponent(
            prefix
        )}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)

        // config.headers.Authorization = accessToken
        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }

        return request(config)
        // return axios.get(requestURI, config)
    }

    /**
     * get current bucket's domain
     * @static
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @returns {Promise}
     * @memberof Qiniu
     */
    static domain(ak, sk, bucket) {
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        const requestURI = `http://api.qiniu.com/v6/domain/list?tbl=${bucket}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)

        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }

        return request(config)
    }

    /**
     * delete file in current bucket
     * @static
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @param {string} key
     * @returns {Promise}
     * @memberof Qiniu
     */
    static delete(ak, sk, bucket, key) {
        const entry = `${bucket}:${key}`
        const encodedEntryURI = Util.urlsafeBase64Encode(entry)
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        const requestURI = `http://rs.qiniu.com/delete/${encodedEntryURI}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)
        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }

        return request(config)
    }

    /**
     * create bucket
     * @static
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @param {string} region
     * @returns {Promise}
     * @memberof Qiniu
     */
    static createBucket(ak, sk, bucket, region) {
        let encodedBucketName = Util.urlsafeBase64Encode(bucket)
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        region = region ? 'region/' + region : ''
        const requestURI = `http://rs.qiniu.com/mkbucketv2/${encodedBucketName}/${region}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)
        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }
        return request(config)
    }

    /**
     * delete bucket
     * @static
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @returns {Promise}
     * @memberof Qiniu
     */
    static removeBucket(ak, sk, bucket) {
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        const requestURI = `http://rs.qiniu.com/drop/${bucket}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)
        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }
        return request(config)
    }

    /**
     * rename file
     * @param {string} ak
     * @param {string} sk
     * @param {string} bucket
     * @param {string} src
     * @param {string} dest
     */
    static renameFile(ak, sk, bucket, src, dest) {
        const mac = {
            accessKey: ak,
            secretKey: sk
        }
        src = `${bucket}:${src}`
        dest = `${bucket}:${dest}`
        let encodedEntryURISrc = Util.urlsafeBase64Encode(src)
        let encodedEntryURIDest = Util.urlsafeBase64Encode(dest)
        const requestURI = `http://rs.qiniu.com/move/${encodedEntryURISrc}/${encodedEntryURIDest}`
        const reqBody = ''
        const accessToken = Util.generateAccessToken(mac, requestURI, reqBody)
        const config = {
            url: requestURI,
            headers: {
                Authorization: accessToken
            }
        }
        return request(config)
    }
}
