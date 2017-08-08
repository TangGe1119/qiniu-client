export default {
    set(key, val, type = 1) {
        const storage = _getStorage(type);
        if(val && (val instanceof Object)) {
            storage.setItem(key, JSON.stringify(val));
            return;
        }
        storage.setItem(key, val);
    },
    get(key, type = 1) {
        const storage = _getStorage(type);
        let val = storage.getItem(key);
        try {
            let jsonVal = JSON.parse(val);
            if(val && jsonVal) {
                return jsonVal;
            }
        }catch(e) {
            return val;
        }
    },
    remove(key, type = 1) {
        const storage = _getStorage(type);
        return storage.removeItem(key);
    }
}
/**
 * type为1表示localStorage 否则为sessionStorage
 */
function _getStorage(type) {
    return type === 1 ? window.localStorage : window.sessionStorage;
}
