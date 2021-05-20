/**
 * Created by lc on 2021/5/20.
 */

const domPropsRE = /\[A-Z]|^(?:value|checked|selected|muted)$/;
export default function patchData(el,key,prevValue,nextValue,isSVG = null) {
    switch (key) {
        case 'style':
            // 将新的样式数据应用到元素
            for (let k in nextValue) {
                el.style[k] = nextValue[k];
            }
            // 移除已经不存在的样式
            for (let k in prevValue) {
                if (!nextValue.hasOwnProperty(k)) {
                    el.style[k] = '';
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
                // 事件
                el.addEventListener(key.slice(2), data[key]);
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