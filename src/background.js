import store from "./store";
global.browser = require("webextension-polyfill");

console.log("background.js loaded");

const headerModify={
    modify:{
        "User-Agent":"Android  com.kuangxiangciweimao.novel  2.6.019,iphone, 12, 28, 9"
    },
    remove:[],
    add:{}
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    const headers = details.requestHeaders;
    
    for (var i = headers.length - 1; i >= 0; i--) {
        const header=headers[i];
        if(headerModify.modify[header.name]){
            header.value=headerModify.modify[header.name]
        }
        else if(headerModify.remove.includes(header.name)){
            headers.splice(i,1)
        }
    }
    // Object.keys(headerModify.add).forEach(headerName=>{

    // });
    console.log('request headers',headers);
    return { requestHeaders: headers };
  },
  { urls: ["https://app.hbooker.com/*"] },
  ["blocking", "requestHeaders"]
);
