
const handler = {
    apply: function (target, thisArg, args) {
        console.log('proxy', target, thisArg, args,arguments);
        try {
            const result = target.apply(thisArg, args);
            if (result instanceof Promise) {

            }
            else {

            }
        }
        catch (e) {

        }
    }
}

/**
 * 给目标对象的属性方法加一成error的拦截层
 * @param {*} targetObject 
 */
export function wrapObjectFunction(targetObject) {
    // console.log('wrap obj',targetObject)
    Object.keys(targetObject).forEach(prop => {
        //console.log('p',prop);
        const propVal = targetObject[prop];
        if (typeof propVal === 'function') {

            targetObject[prop] = new Proxy(propVal, handler);
            //console.log('p2', targetObject[prop])
        }
    });
}

export const test = {
    handle() {
        return 123;
    }
}

wrapObjectFunction(test)