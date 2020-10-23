const ajax = axios.create({
    baseURL: "",
    timeout: 60000 * 10, //10分钟
    withCredentials: false, ////跨域请求是否使用凭证
    // `transformRequest` 允许在向服务器发送前，修改请求数据
    // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
    // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
    transformRequest: [function (data, headers) {
        // 对 data 进行任意转换处理
        if (data instanceof FormData || typeof data === "string") {
            return data;
        }
        if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
            return Object.keys(data).map(x => {
                return `${x}=${encodeURIComponent(data[x])}`;
            }).join('&');
        }
        else {
            if (!headers["Content-Type"])
                headers["Content-Type"] = "application/json";
            // 默认JSON
            return JSON.stringify(data);
        }
    }],

    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
    transformResponse: [function (data) {
        // 对 data 进行任意转换处理
        console.log('resp', data);
        return data;
    }],
});

ajax.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

ajax.interceptors.request.use(function (config) {
    // const identity = identityManager.getIdentity(serverKey) || {};
    // const tokenPara = identity.tokenPara || {};
    // config.params = Object.assign(config.params || {}, para, tokenPara);

    return config;
});
var formData = new FormData();
formData.append("def", "defff");
ajax.post("http://www.shbaoenergy.com:8081/sso", {
    a: "abc我的",
    b: 123
}, {
    headers: {
        // "Content-Type": "application/x-www-form-urlencoded"
    }
})

// ajax.post("https://www.baidu.com", formData, {
//     headers: {
//         "Content-Type": "application/formdata"
//     }
// })