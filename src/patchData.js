/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 13:25:43 
 * @Last Modified by:   LcLichong 
 * @Last Modified time: 2021-05-23 13:25:43 
 */

import typeOf from './utility'

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
export default function patchData(el, key, prevValue, nextValue, isSVG = null) {
    switch (key) {
        case 'style':
            // 将新的样式数据应用到元素
            for (let k in nextValue) {
                el.style[k] = nextValue[k];
            }
            // 移除已经不存在的样式
            for (let k in prevValue) {
                if (nextValue && !nextValue.hasOwnProperty(k)) {
                    el.style[k] = '';
                } else if (!typeOf(nextValue,'object')) {
                    el.style = nextValue;
                    break;
                }
            }
            break;
        case 'class':
            if (isSVG) {
                el.setAttribute('class', nextValue);
            } else {
                el.className = nextValue;
            }
            break;
        default:
            if (key[0] === 'o' && key[1] === 'n') {
                if (nextValue && typeOf(nextValue,'function')) {
                    // 添加事件
                    el.addEventListener(key.slice(2), nextValue);
                } else if (nextValue && !typeOf(nextValue,'function')) {
                    console.error(`${nextValue} is not a function`)
                    // nextValue 不再是 function 了，证明没有事件了，删除它
                    el.removeEventListener(key.slice(2), prevValue);
                } else {
                    // nextValue 不存在，证明没有事件了，删除它
                    el.removeEventListener(key.slice(2), prevValue);
                }
            }
            if (domPropsRE.test(key)) {
                // 当做 DOM Prop 处理
                el[key] = nextValue;
            } else {
                el.setAttribute(key, nextValue);
            }
            break;
    }
}