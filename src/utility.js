/**
 * Created by lc on 2021/5/20.
 */

export default function typeOf(value, type) {
    if (type == 'object') {
        type = '[object Object]';
    } else if (type == 'function') {
        type = '[object Function]';
    } else if (type == 'number') {
        type = '[object Number]';
    } else if (type == 'string') {
        type = '[object String]';
    }
    let result = Object.prototype.toString.apply(value) === type;
    return result;
}