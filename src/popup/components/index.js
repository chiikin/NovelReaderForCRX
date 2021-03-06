import Login from "./Login.vue"
import ChapterView from "./ChapterView.vue"
import Bookshelf from "./Bookshelf.vue"
import About from "./About.vue"
import Donate from "./Donate.vue"
export default {
    install:function(Vue){
        //Vue
        Vue.component(Login.name,Login);
        Vue.component(ChapterView.name,ChapterView);
        Vue.component(Bookshelf.name,Bookshelf);
        Vue.component(About.name,About);
        Vue.component(Donate.name,Donate);
    }
}