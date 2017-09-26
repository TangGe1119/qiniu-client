import Qs from 'qs'
export default {
    url: '',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    transformRequest: [
        function(data) {
            if (data) {
                data = Qs.stringify(data)
                return data
            } else {
                return
            }
        }
    ],
    transformResponse: [
        function(data) {
            return data
        }
    ],
    paramsSerializer: function(params) {
        return Qs.stringify(params, { arrayFormat: 'brackets' })
    }
}
