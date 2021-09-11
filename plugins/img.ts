/*
 * @Author: kyleslie 
 * @Date: 2021-06-28 16:37:09 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-08-04 21:06:27
 */
import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
import kayaks from "kayaks";
// const store =kayaks({
//     add:(pre={},action)=>{
//         const {type} = action;
//         switch(type){
//             case 'add':return {name:Math.random()};
//             default: return pre;
//         }
//     }
// });
// console.log(store.getState());
// store.subscribe(()=>{
//    console.log('数据更新了');
//    setTimeout(() => {
//        console.log(store.getState());
        
//    }, 200);
   
// })
export class Img extends pluginBase {
    preSrcName: string;
    srcName: string;
    dataName: string;
    element: Element;
    imgs: any[];
    delay: number;
    observe: IntersectionObserver;
    IntersectionObserver: boolean;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['prename', 'srcname', 'dataname', 'delay', 'intersectionobserver|bool'],
                ['preSrcName', 'srcName', 'dataName', 'delay', 'IntersectionObserver'],
                ['', '', 'rows', 50, false]
            );
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.init(rootDom);
        rootDom.tagName = 'div';
        rootDom.defineEl = this;
        this.element = rootDom;
    }
    init(dom: Element) {
        let that = this;
        let timer = null;
        if (!this.IntersectionObserver) {
            dom.addEvent(new NEvent('scroll',
                function (dom, module, e, el) {
                    if (timer != null) clearTimeout(timer);
                    timer = setTimeout(() => {
                        that.refresh(el, module);
                    }, that.delay || 50);
                }));
        }
        dom.addRenderOp(this.beforeRender, 'before');
        dom.addRenderOp(this.afterRender,'after');
    };
    beforeRender(dom: Element, module: Module) {
        super.beforeRender(dom,module);
         let that=<Img>dom.defineEl;
        let child = dom.children[0];
        let img: Element = child.query({
            tagName: 'img'
        });
        img.setProp('src', new Expression(`${that.preSrcName}`), true);
        new Directive('repeat', that.dataName, child, dom);
    };
    afterRender(dom: Element, module: Module) {
        let that=<Img>dom.defineEl;
        if (that.needPreRender) {
            setTimeout(() => {
                if (that.IntersectionObserver) {
                    that.observe = new IntersectionObserver(function (entries) {
                        entries.forEach(v => {
                            if (v.isIntersecting) {
                                let em: Model = module.getElement(v.target.getAttribute('key')).model;
                                if (em.hasOwnProperty(that.srcName)) {
                                    em[that.preSrcName] = em[that.srcName];
                                    delete em[that.srcName];
                                };
                                that.observe.unobserve(v.target);
                            }
                        });
                    }, {
                        root: module.getNode(dom.key),
                    });
                    that.imgs.forEach(img => {
                        let imgEl = module.getNode(img);
                        that.observe.observe(imgEl);
                    })
                }
                else {
                    console.log('refres');
                    that.refresh(module.getNode(dom.key), module);
                }
            }, 50);
        }
        that.imgs = that.getImgElements(dom);

    }
    getImgElements(dom: Element, res = []) {
        for (let i = 0; i < dom.children.length; i++) {
            let item = dom.children[i];
            if (item.tagName === 'img') {
                res.push(item.key);
            } if (item.children.length > 0) {
                this.getImgElements(item, res);
            }
        }
        return res;
    }
    refresh(el: HTMLElement, module: Module) {
        console.log('refresh');
        // store.dispatch({
        //     type:'add',
        // })
        let height = el.offsetHeight;
        let start = el.scrollTop,
            end = start + height;
        let hasPosition = el.style.position == '';
        for (let i = 0; i < this.imgs.length; i++) {
            let key: any = this.imgs[i];
            let imgEl = module.getNode(key);
            let elemTop = hasPosition ? imgEl.offsetTop - el.offsetTop : imgEl.offsetTop;
            if (elemTop >= start && elemTop <= end) {
                let em: Model = module.getElement(key).model;
                if (em.hasOwnProperty(this.srcName)) {
                    em[this.preSrcName] = em[this.srcName];
                    delete em[this.srcName];
                }
            }
            if (elemTop > end) break;

        }
    }
}
DefineElementManager.add('UI-IMG', {
    init: function (element: Element, parent?: Element) {
        new Img(element);
     
    }
});
