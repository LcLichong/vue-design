/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 13:25:39 
 * @Last Modified by: LcLichong
 * @Last Modified time: 2021-05-25 22:30:39
 */

import { h, Fragment, Portal } from './h'
import { Component } from './component'
import render from './render'

// const prevNode = h('ul', null, [
//     h('li', { key: 'a' }, 1),
//     h('li', { key: 'b' }, 2),
//     h('li', { key: 'c' }, 3)
// ])

// setTimeout(() => {
//     const nextNode = h('ul', null, [
//         h('li', { key: 'c' }, 3),
//         h('li', { key: 'a' }, 1),
//         h('li', { key: 'b' }, 2)
//     ])
//     render(nextNode, document.querySelector('#app'));
// }, 2000)

// render(prevNode, document.querySelector('#app'));

// const prevNode = h('ul', null, [
//     h('li', { key: 'a' }, 1),
//     h('li', { key: 'b' }, 2),
//     h('li', { key: 'c' }, 4),
//     h('li', { key: 'd' }, 3)
// ])

// setTimeout(() => {
//     const nextNode = h('ul', null, [
//         h('li', { key: 'c' }, 4),
//         h('li', { key: 'a' }, 1),
//         h('li', { key: 'd' }, 3),
//         h('li', { key: 'b' }, 2)
//     ])
//     render(nextNode, document.querySelector('#app'));
// }, 2000)


const prevNode = h('ul', null, [
    h('li', { key: 'a' }, 'li-a'),
    h('li', { key: 'b' }, 'li-b'),
    h('li', { key: 'c' }, 'li-c')
])

setTimeout(() => {
    const nextNode = h('ul', null, [
        h('li', { key: 'd' }, 'li-d'),
        h('li', { key: 'b' }, 'li-b'),
        h('li', { key: 'a' }, 'li-a'),
        h('li', { key: 'c' }, 'li-c')
    ])
    render(nextNode, document.querySelector('#app'));
}, 2000)

render(prevNode, document.querySelector('#app'));