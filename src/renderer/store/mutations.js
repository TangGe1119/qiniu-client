import * as types from './mutations-type';

export default {
    [types.SET_ACCESS_KEY](state, accessKey) {
        state.accessKey = accessKey;
    },
    [types.SET_SECRET_KEY](state, secretKey) {
        state.secretKey = secretKey;
    },
    [types.SET_BUCKETS](state, buckets) {
        state.buckets = buckets;
    }
}