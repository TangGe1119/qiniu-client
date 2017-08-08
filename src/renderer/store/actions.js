import * as types from './mutations-type';
import storage from '../common/storage';

export const setKeys = ({commit}, {accessKey, secretKey}) => {
    // TODO 通过七牛api验证key
    commit(types.SET_ACCESS_KEY, accessKey);
    commit(types.SET_SECRET_KEY, secretKey);
    storage.set('AK', accessKey);
    storage.set('SK', secretKey);
}