import storage from '../common/storage'
const { getGlobal } = require('electron').remote
export default {
    ak: storage.get('AK'),
    sk: storage.get('SK'),
    buckets: storage.get('BUCKETS', 2) || [],
    downloadPath: storage.get('DOWN_PATH') || getGlobal('rootPath')
}
