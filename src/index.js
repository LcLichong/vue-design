/**
 * Created by lc on 2021/5/15.
 */

import {h, Fragment, Portal} from './h'
import {Component} from './component'
import render from './render'

// const elementVNode = h('div', null, h('span'))
// console.log(elementVNode)
//
// const elementWithTextVNode = h('div', null, '我是文本')
// console.log(elementWithTextVNode)
//
// const fragmentVNode = h(Fragment, null, [h('h1'), h('h1')])
// console.log(fragmentVNode)
//
// const portalVNode = h(
//     Portal,
//     {
//         target: '#box'
//     },
//     h('h1')
// )
// console.log(portalVNode)
//
// // 一个函数式组件
// function MyFunctionalComponent() {}
// // 传递给 h 函数的第一个参数就是组件函数本身
// const functionalComponentVNode = h(MyFunctionalComponent, null, h('div'))
// console.log(functionalComponentVNode)
//
// // 有状态组件
// class MyStatefulComponent extends Component {}
// const statefulComponentVNode = h(MyStatefulComponent, null, h('div'))
// console.log(statefulComponentVNode)

// const elementVNode = h('svg', {
//     class: ['class-a', [
//         'class-b',
//         'class-c',
//         'class-d'
//     ]],
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// }, h('circle',{
//     cx: '50',
//     cy: '50',
//     r: '40',
//     style: {
//         stroke: '#006600',
//         fill: '#00cc00'
//     }
// }))

// const elementVNode = h('div', {
//     class: {
//         'class-b': true,
//         'class-c': true
//     },
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// })

// const elementVNode = h('div', {
//     class: ['class-a', 'class-b'],
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// })

// const elementVNode = h('div', {
//     class: ['class-a', {
//         'class-b': true,
//         'class-c': true
//     }],
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// })

// const elementVNode = h('div', {
//     class: ['class-a', [
//         'class-b',
//         'class-c',
//         'class-d'
//     ]],
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// })

// const elementVNode = h('input', {
//     class: 'cls-a',
//     type: 'checkbox',
//     checked: true,
//     custom: '1'
// })

// function handler() {
//     alert('click me')
// }
//
// const elementVNode = h('div', {
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     },
//     onclick: handler
// })

// const elementVNode = h(
//     'div',
//     {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     },
//     '我是文本'
// )

// const elementVNode = h(
//     'div',
//     {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     },
//     h(Fragment, null)
// )

// const elementVNode = h(
//     'div',
//     {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     },
//     h(Portal, { target: '#portal-box' }, [
//         h('span', null, '我是标题1......'),
//         h('span', null, '我是标题2......')
//     ])
// )

// class MyComponent {
//     render() {
//         return h(
//             'div',
//             {
//                 style: {
//                     background: 'green',
//                 }
//             },
//             [
//                 h('span', null, '我是组件的标题1......'),
//                 h('span', null, '我是组件的标题2......')
//             ]
//         )
//     }
// }
// const compVnode = h(MyComponent)

// function MyFunctionalComponent() {
//     // 返回要渲染的内容描述，即 VNode
//     return h(
//         'div',
//         {
//             style: {
//                 background: 'green'
//             }
//         },
//         [
//             h('span', null, '我是组件MyFunctionalComponent的标题1......'),
//             h('span', null, '我是组件MyFunctionalComponent的标题2......')
//         ]
//     )
// }
// const compVnode = h(MyFunctionalComponent)
// render(compVnode, document.querySelector('#app'))

// render(elementVNode, document.querySelector('#app'))


// 旧的 VNode
// const prevVNode = h('div', {
//     style: {
//         width: '100px',
//         height: '100px',
//         backgroundColor: 'red'
//     }
// })

// 新的 VNode
// const nextVNode = h('div', {
//     style: {
//         width: '100px',
//         height: '100px',
//         border: '1px solid green'
//     }
// })

// const nextVNode = h('div',{
//     class: '123'
// })

// function handler() {
//     alert('click me')
// }
//
// const prevVNode = h('div', {
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     },
//     onclick: handler
// })
//
// const nextVNode = h('div', {
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'blue'
//     }
// })

// // 旧的 VNode
// const prevVNode = h('div', {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'red'
//         }
//     },
//     [
//         h('p', null, '123'),
//         h('p', null, '456')
//     ]
// )
// // 新的 VNode
// const nextVNode = h('div', {
//         style: {
//             height: '100px',
//             width: '100px',
//             background: 'green'
//         }
//     },
//     [
//         h('p', null, '123'),
//         h('p', null, '777'),
//         h('p', null, '9090')
//     ]
// )
//

// 创建一个文本节点
// const prevVNode = h('p', null, '旧文本');
// const nextVNode = h('p', null, '新文本');


// const prevVNode = h(Fragment, null,
//     [
//         h('p', null, '旧片段子节点1'),
//         h('p', null, '旧片段子节点2')
//     ]
// )
// const nextVNode = h(Fragment, null,
//     [
//         h('p', null, '新片段子节点1'),
//         h('p', null, '新片段子节点2')
//     ]
// )

const prevVNode = h(Portal, { target: '#box1' },h('p', null, '旧片段子节点1'))
const nextVNode = h(Portal, { target: '#box2' },h('p', null, [
    h('p',null ,'123'),
    h('p',null ,'456'),
]))

render(prevVNode, document.getElementById('app'))
// 2秒后更新
setTimeout(() => {
    render(nextVNode, document.getElementById('app'))
}, 2000)
