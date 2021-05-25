/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 13:25:39 
 * @Last Modified by: LcLichong
 * @Last Modified time: 2021-05-25 11:06:03
 */

import { h, Fragment, Portal } from './h'
import { Component } from './component'
import render from './render'


// class ChildComponent1 {
//     render() {
//         return h('div', null, '123');
//     }
//     unmounted() {
//         console.log('ChildComponent1 的 unmounted');
//     }
// }

// class ChildComponent2 {
//     render() {
//         return h('div', null, '456');
//     }
//     unmounted() {
//         console.log('ChildComponent2 的 unmounted');
//     }
// }

// class ParentComponent {
//     // 本地状态
//     isTrue = true

//     mounted() {
//         setTimeout(() => {
//             this.isTrue = false;
//             this._update();
//         }, 2000)
//     }

//     render() {
//         return this.isTrue ? h(ChildComponent1) : h(ChildComponent2)
//     }
// }

// function MyFunctionalComp(props){
//     return h('div',null,props.text);
// }

// class ParentComponent {
//     // 本地状态
//     localState = 'one'

//     mounted() {
//         setTimeout(() => {
//             this.localState = 'two';
//             this._update();
//         }, 2000)
//     }

//     render() {
//         return h(MyFunctionalComp,{
//             text: this.localState
//         })
//     }
// }

// const componentNode = h(ParentComponent);
// render(componentNode, document.querySelector('#app'));

const prevNode = h('ul', null, [
    h('li', null, '1'),
    h('li', null, '2')
])

setTimeout(() => {
    const nextNode = h('ul', null, [
        h('li', null, '4'),
        h('li', null, '5'),
        h('li', null, '6')
    ])
    render(nextNode, document.querySelector('#app'));
}, 2000)

render(prevNode, document.querySelector('#app'));