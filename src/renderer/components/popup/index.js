import Vue from 'Vue';
import Popup from './Popup';
const Message = Vue.extend(Popup);
const message = msg => {
    const instance = new Message({data: {msg}}); // 获取到Message的实例
    const $vm = instance.$mount(); // 手动挂载组件实例
    document.querySelector('body').appendChild($vm.$el); // 将组件的dom插入到指定位置
}
export default message;