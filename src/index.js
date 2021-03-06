/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 13:25:39 
 * @Last Modified by: LcLichong
 * @Last Modified time: 2021-05-28 14:10:08
 */

import { h, Fragment, Portal } from './h'
import { Component } from './component'
import render from './render'


// const prevNode = h('ul', null, [
//     h('li', { key: 'a' }, 'li-a'),
//     h('li', { key: 'b' }, 'li-b'),
//     h('li', { key: 'c' }, 'li-c')
// ])

// setTimeout(() => {
//     const nextNode = h('ul', null, [
//         h('li', { key: 'c' }, 'li-c'),
//         h('li', { key: 'a' }, 'li-a'),
//         h('li', { key: 'd' }, 'li-d'),
//         h('li', { key: 'b' }, 'li-b')
//     ])
//     render(nextNode, document.querySelector('#app'));
// }, 2000)


const prevNode = h('ul', null, [
    h('li', { key: 'a' }, 'li-a'),
    h('li', { key: 'b' }, 'li-b'),
    h('li', { key: 'c' }, 'li-c'),
    h('li', { key: 'd' }, 'li-d'),
    h('li', { key: 'f' }, 'li-f'),
    h('li', { key: 'e' }, 'li-e')
])

setTimeout(() => {
    console.log('two seconds later...');
    const nextNode = h('ul', null, [
        h('li', { key: 'a' }, 'li-aa'),
        h('li', { key: 'c' }, 'li-cc'),
        h('li', { key: 'd' }, 'li-dd'),
        h('li', { key: 'b' }, 'li-bb'),
        h('li', { key: 'g' }, 'li-gg'),
        h('li', { key: 'e' }, 'li-ee')
    ])
    render(nextNode, document.querySelector('#app'));
}, 2000)

render(prevNode, document.querySelector('#app'));