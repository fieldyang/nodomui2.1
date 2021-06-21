import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
class Img extends pluginBase {
    preSrcName: string;
    srcName: string;
    dataName: string;
    element: Element;
    imgs: any[];
    delay: number;
    observe: IntersectionObserver;
    IntersectionObserver: boolean = false;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['prename', 'srcname', 'dataname', 'delay'],
                ['preSrcName', 'srcName', 'dataName', 'delay'],
                ['', '', 'rows', 50]
            );
            if (rootDom.hasProp('intersectionobserver')) {
                this.IntersectionObserver = true;
            }

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
    init(element: Element) {
        let that = this;
        let timer = null;
        if (!this.IntersectionObserver) {
            element.addEvent(new NEvent('scroll',
                function (dom, module, e, el) {
                    if (timer != null) clearTimeout(timer);
                    timer = setTimeout(() => {
                        that.refresh(el, module);
                    }, that.delay || 50);
                }));
        }

    };
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        let child = dom.children[0];
        let img:Element = child.query({
            tagName: 'img'
        });
        img.setProp('src', new Expression(`${this.preSrcName}`), true);
        new Directive('repeat', this.dataName, child, dom);
    };
    afterRender(module: Module, dom: Element) {
        let that = this;
        super.afterRender(module, dom);
        if (this.needPreRender) {
            setTimeout(() => {
                if (this.IntersectionObserver) {
                    this.observe = new IntersectionObserver(function (entries) {
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
                    this.imgs.forEach(img => {
                        let imgEl = module.getNode(img);
                        this.observe.observe(imgEl);
                    })
                } else {
                    this.refresh(module.getNode(dom.key), module);
                }
            }, 50);
        }
        this.imgs = this.getImgElements(dom);

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
DefineElementManager.add('NIMG', {
    init: function (element: Element, parent?: Element) {
        new Img(element);
    }
});
