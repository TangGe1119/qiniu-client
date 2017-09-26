import * as types from './mutations-type'
import storage from '../common/storage'
import Qiniu from '../common/qiniu'
import store from '../store'

export const setKeys = ({ commit }, { ak, sk }) => {
    return new Promise((resolve, reject) => {
        Qiniu.buckets(ak, sk)
            .then(buckets => {
                commit(types.SET_ACCESS_KEY, ak)
                commit(types.SET_SECRET_KEY, sk)
                storage.set('AK', ak)
                storage.set('SK', sk)
                resolve()
            })
            .catch(e => {
                reject(e)
            })
    })
}

export const getBuckets = ({ commit, state }) => {
    let ak = state.ak
    let sk = state.sk
    return new Promise((resolve, reject) => {
        Qiniu.buckets(ak, sk)
            .then(buckets => {
                commit(types.SET_BUCKETS, buckets)
                storage.set('BUCKETS', buckets, 2)
                resolve()
            })
            .catch(e => {
                reject(e)
            })
    })
}

export const getList = ({ commit, state }, { bucket, marker, prefix }) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.list(ak, sk, bucket, marker, prefix)
}

export const getListByPage = (
    { commit, state },
    { bucket, pageSize = 10, pageNum, marker = '', prefix = '' }
) => {
    let ak = state.ak
    let sk = state.sk
    return new Promise((resolve, reject) => {
        Qiniu.list(ak, sk, bucket, marker, prefix)
            .then(list => {
                let data = list.items
                data.sort((a, b) => {
                    return b.putTime - a.putTime
                })
                let start = pageSize * (pageNum - 1)
                let end = pageSize * pageNum
                let sum = data.length
                let items = data.slice(start, end)
                resolve({
                    items,
                    pageSize,
                    sum
                })
            })
            .catch(e => {
                reject(e)
            })
    })
}

export const getDomain = ({ commit, state }, bucket) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.domain(ak, sk, bucket)
}

export const setDownloadPath = ({ commit }, path) => {
    commit('SET_DOWNLOAD_PATH', path)
    storage.set('DOWN_PATH', path)
}

export const deleteFile = ({ commit, state }, { bucket, key }) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.delete(ak, sk, bucket, key)
}

export const createBucket = ({ commit, state }, { bucket, region }) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.createBucket(ak, sk, bucket, region)
}

export const removeBucket = ({ commit, state }, { bucket }) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.removeBucket(ak, sk, bucket)
}

export const renameFile = ({ commit, state }, { bucket, src, dest }) => {
    let ak = state.ak
    let sk = state.sk
    return Qiniu.renameFile(ak, sk, bucket, src, dest)
}
