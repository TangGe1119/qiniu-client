import * as types from './mutations-type';
import storage from '../common/storage';
import Qiniu from '../common/qiniu';
import store from '../store';

export const setKeys = ({commit}, {ak, sk}) => {
    return new Promise((resolve, reject) => {
        Qiniu.buckets(ak, sk).then(buckets => {
            commit(types.SET_ACCESS_KEY, ak);
            commit(types.SET_SECRET_KEY, sk);
            storage.set('AK', ak);
            storage.set('SK', sk);
            resolve();
        }).catch(e => {
            reject(e);
        });
    });
}

export const getBuckets = ({commit, state}) => {
    let ak = state.ak;
    let sk = state.sk;
    return new Promise((resolve, reject) => {
        Qiniu.buckets(ak, sk).then(buckets => {
            commit(types.SET_BUCKETS, buckets);
            storage.set('BUCKETS', buckets);
            resolve();
        }).catch(e => {
            reject(e);
        });
    });
}

export const getList = ({commit, state}, {bucket, marker, prefix}) => {
    let ak = state.ak;
    let sk = state.sk;
    return Qiniu.list(ak, sk, bucket, marker, prefix)
}

export const getDomain = ({commit, state}, bucket) => {
    let ak = state.ak;
    let sk = state.sk;
    return Qiniu.domain(ak, sk, bucket);
}

export const setDownloadPath = ({commit}, path) => {
    storage.set('DOWN_PATH', path);
}