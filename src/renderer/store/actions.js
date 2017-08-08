import * as types from './mutations-type';
import storage from '../common/storage';
import Qiniu from '../common/qiniu';
import bus from '../bus';

export const setKeys = ({commit}, {ak, sk}) => {
    return new Promise((resolve, reject) => {
        Qiniu.buckets(ak, sk).then(buckets => {
            // TODO 通过七牛api验证key
            commit(types.SET_ACCESS_KEY, ak);
            commit(types.SET_SECRET_KEY, sk);
            commit(types.SET_BUCKETS, buckets);
            storage.set('AK', ak);
            storage.set('SK', sk);
            storage.set('BUCKETS', buckets);
            resolve();
        }).catch(e => {
            bus.$emit('message', '秘钥输入有误'); 
            reject();
        });
    });
}