function storageAvailable(storage) {
    try {
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch (e) {
        var ret = e instanceof DOMException && (
            // 当异常是由浏览器存储容量不够造成时，需要排除浏览器存储容量限额为0的特殊情况
            // 非Firefox浏览器存储内容大小超出存储容量时所报出异常的code
            e.code === 22 ||
            // Firefox浏览器存储内容大小超出存储容量时所报出异常的code
            e.code === 1014 ||
            // 除了检测异常的code属性外，还需要检测异常的name属性，防止部分情况下异常没有code属性
            // 非Firefox浏览器
            e.name === 'QuotaExceededError' ||
            // Firefox浏览器
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // 排除存储容量不为0的情况
            storage.length !== 0;
        return ret;
    }
}

const webLocalStorage=window.localStorage;
const webSessionStorage=window.sessionStorage;

export const sessionStorage={};
export const localStorage={};
sessionStorage.valid = storageAvailable(webLocalStorage);
localStorage.valid = storageAvailable(webSessionStorage);
//sessionStorage
sessionStorage.getString = function (key, defaultValue) {
    if (!sessionStorage.valid)
        return defaultValue;

    var value = webSessionStorage.getItem(key);
    if (value === null || value === undefined)
        return defaultValue;
    else
        return value;
}

sessionStorage.setString = function (key, value) {
    if (!sessionStorage.valid)
        return;
        webSessionStorage.setItem(key, value);
}

sessionStorage.getObject = function (key, defaultValue) {
    var json = webSessionStorage.getItem(key);
    if (!json)
        return defaultValue;

    try {
        return JSON.parse(json);
    }
    catch (e) {
        return defaultValue;
    }
}
sessionStorage.setObject = function (key, value) {
    if (!sessionStorage.valid)
        return;
        webSessionStorage.setItem(key, JSON.stringify(value));
}
sessionStorage.remove = function (key) {
    if (!sessionStorage.valid)
        return;
        webSessionStorage.removeItem(key);
}
sessionStorage.clear = function () {
    if (!sessionStorage.valid)
        return;
        webSessionStorage.clear();
}

sessionStorage.removeByRegex = function (regex) {
    if (!sessionStorage.valid)
        return;
    if (typeof regex === 'string')
        regex = new RegExp(regex);
    if (!(regex instanceof RegExp))
        return;
    for (var k in webSessionStorage) {
        if (regex.test(k))
        webSessionStorage.removeItem(k);
    }
}

//localStorage
localStorage.getString = function (key, defaultValue) {
    if (!localStorage.valid)
        return defaultValue;

    var value = webLocalStorage.getItem(key);
    if (value === null || value === undefined)
        return defaultValue;
    else
        return value;
}

localStorage.setString = function (key, value) {
    if (!localStorage.valid)
        return;
        webLocalStorage.setItem(key, value);
}

localStorage.getObject = function (key, defaultValue) {
    var json = webLocalStorage.getItem(key);
    if (!json)
        return defaultValue;

    try {
        return JSON.parse(json);
    }
    catch (e) {
        return defaultValue;
    }
}
localStorage.setObject = function (key, value) {
    if (!localStorage.valid)
        return;
        webLocalStorage.setItem(key, JSON.stringify(value));
}

localStorage.remove = function (key) {
    if (!localStorage.valid)
        return;
        webLocalStorage.removeItem(key);
}
localStorage.clear = function () {
    if (!localStorage.valid)
        return;
        webLocalStorage.clear();
}

localStorage.removeByRegex = function (regex) {
    if (!localStorage.valid)
        return;
    if (typeof regex === 'string')
        regex = new RegExp(regex);
    if (!(regex instanceof RegExp))
        return;
    for (var k in webLocalStorage) {
        if (regex.test(k))
        webLocalStorage.removeItem(k);
    }
}

