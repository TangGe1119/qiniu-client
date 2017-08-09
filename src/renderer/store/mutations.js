import * as types from './mutations-type';

export default {
    [types.SET_ACCESS_KEY](state, ak) {
        state.ak = ak;
    },
    [types.SET_SECRET_KEY](state, sk) {
        state.sk = sk;
    },
    [types.SET_BUCKETS](state, buckets) {
        state.buckets = buckets;
    }
}