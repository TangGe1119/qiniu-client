import  axios from 'axios';
import bus from './bus';
import router from './router';
import storage from './common/js/storage';

// 生成一个新的实例 防止污染axios对象
const request = axios.create({
    baseURL: 'http://192.168.10.172:8080/robot-cloud-admin-webapp',
    // baseURL: 'http://192.168.0.185:8081',
    headers: {
        'Content-Type': 'application/json'
    }
});

// requset拦截器添加token
// request.interceptors.request.use(
//     config => {
//         const user = storage.get('USER_INFO');
//         let token = user ? user.token : '';
//         if(token) {
//             config.headers['Token'] = token;
//         }
//         return config;
//     },
//     err => {
//         return Promise.reject(err);
//     }
// );

// response拦截器筛选返回结果
// request.interceptors.response.use(
//     response => {
//         if(response.data.code === '-1') { // 当返回code为-1时，表示没有登录 重定向到登录页面
//             bus.$emit('ERROR', response.data.msg);
//             router.replace('/login');
//             return Promise.reject();
//         }
//         if(response.data.code !== '1') { // 不等于1时 表示请求执行失败
//             bus.$emit('ERROR', response.data.msg);
//             return Promise.reject();
//         }
//         return response;
//     }, 
//     err => {
//         bus.$emit('ERROR', '网络错误，请检查网络连接');
//         return Promise.reject(err);
//     }
// );

export default request;