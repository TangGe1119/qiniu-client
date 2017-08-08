import storage from '../common/storage';

export default {
    accessKey: storage.get('AK'),
    secretKey: storage.get('SK'),
    buckets: storage.get('BUCKETS')
}