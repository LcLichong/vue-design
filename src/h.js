/*
 * @Author: LcLichong 
 * @Date: 2021-05-23 13:25:29 
 * @Last Modified by: LcLichong
 * @Last Modified time: 2021-05-25 14:10:00
 */


import {VNodeFlags, ChildrenFlags} from './flags'

const Fragment = Symbol();
const Portal = Symbol();

function h(tag, data = null, children = null) {
    let flags = null;
    let childFlags = null;
    if (typeof tag === 'string') {
        flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ElEMENT_HTML;
        if(data && data.class){
            data.class = normalizeClass(data.class);
        }
    } else if (tag === Fragment) {
        flags = VNodeFlags.FRAGMENT
    } else if (tag === Portal) {
        flags = VNodeFlags.PORTAL
        tag = data && data.target
    } else {
        if (tag !== null && typeof tag === 'object') {
            // 兼容Vue2 的对象式组件
            flags = tag.functional ? VNodeFlags.COMPONENT_FUNCTIONAL : VNodeFlags.COMPONENT_STATEFUL_NORMAL
        } else if (typeof tag === 'function') {
            // Vue3 的类组件
            flags = tag.prototype && tag.prototype.render ? VNodeFlags.COMPONENT_STATEFUL_NORMAL : VNodeFlags.COMPONENT_FUNCTIONAL
        }
    }
    if (Array.isArray(children)) {
        const {length} = children;
        if (length === 0) {
            // 没有children
            childFlags = ChildrenFlags.NO_CHILDREN
        } else if (length === 1) {
            // 单个子节点
            childFlags = ChildrenFlags.SINGLE_VNODE
            children = children[0]
        } else {
            // 多个子节点，且子节点使用key
            childFlags = ChildrenFlags.KEYED_VNODES
            children = normalizeVNodes(children)
        }
    } else if (children == null) {
        // 没有子节点
        childFlags = ChildrenFlags.NO_CHILDREN
    } else if (children._isVNode) {
        // 单个子节点
        childFlags = ChildrenFlags.SINGLE_VNODE
    } else {
        // 其他情况都作为文本节点处理，即单个子节点，会调用 createTextVNode 创建纯文本类型的 VNode
        childFlags = ChildrenFlags.SINGLE_VNODE
        children = createTextVNode(children + '')
    }
    return {
        _isVNode: true,
        flags,
        tag,
        data,
        key : data && data.key ? data.key : null,
        children,
        childFlags,
        el: null
    }
}

function createTextVNode(text) {
    return {
        _isVNode: true,
        // flags 是 VNodeFlags.TEXT
        flags: VNodeFlags.TEXT,
        tag: null,
        data: null,
        // 纯文本类型的 VNode，其 children 属性存储的是与之相符的文本内容
        children: text,
        // 文本节点没有子节点
        childFlags: ChildrenFlags.NO_CHILDREN,
        el: null
    }
}

function normalizeVNodes(children) {
    const newChildren = [];
    // 遍历 children
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.key == null) {
            // 如果原来的 VNode 没有key，则使用竖线(|)与该VNode在数组中的索引拼接而成的字符串作为key
            child.key = '|' + i;
        }
        newChildren.push(child);
    }
    // 返回新的children，此时 children 的类型就是 ChildrenFlags.KEYED_VNODES
    return newChildren;
}

function normalizeClass(classValue) {
    let res = '';
    if (Array.isArray(classValue)) {
        for (let value of classValue) {
            if (typeof value === 'string') {
                res = `${res} ${value}`;
            }
            else if (Array.isArray(value)) {
                for (let v of value) {
                    res = `${res} ${v}`;
                }
            } else {
                for (let v in value) {
                    if (v) {
                        res = `${res} ${v}`;
                    }
                }
            }
        }
    } else if (classValue != null && typeof classValue === 'object') {
        for (let value in classValue) {
            res = `${res} ${value}`;
        }
    } else {
        res = `${classValue}`;
    }
    return res.trim();
}

export {
    Fragment,
    Portal,
    h,
    createTextVNode
}