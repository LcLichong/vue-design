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
//     style: {
//         height: '100px',
//         width: '100px',
//         background: 'red'
//     }
// }, h('circle',{
//     style: {
//         height: '50px',
//         width: '50px',
//         background: 'green'
//     }
// }))

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

// const elementVNode = h('input', {
//     class: 'cls-a',
//     type: 'checkbox',
//     checked: true,
//     custom: '1'
// })

// function handler() {
//     alert('click me')
// }
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

function MyFunctionalComponent() {
    // 返回要渲染的内容描述，即 VNode
    return h(
        'div',
        {
            style: {
                background: 'green'
            }
        },
        [
            h('span', null, '我是组件MyFunctionalComponent的标题1......'),
            h('span', null, '我是组件MyFunctionalComponent的标题2......')
        ]
    )
}
const compVnode = h(MyFunctionalComponent)
render(compVnode, document.querySelector('#app'))



