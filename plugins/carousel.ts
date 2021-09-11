/*
 * @Author: kyleslie 
 * @Date: 2021-06-28 16:36:44 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-08-04 21:07:43
 */
import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager, ModuleFactory } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
const enum cls {
    left = 'nd-carousel-left',
    next = 'nd-carousel-next',
    prev = 'nd-carousel-prev',
    right = 'nd-carousel-right',
    this = 'nd-carousel-this',
    arrow = 'nd-carousel-arrow',
    iconUp = 'nd-icon-arrow-up',
    iconDown = 'nd-icon-arrow-down',
    iconLeft = 'nd-icon-arrow-left',
    iconRight = 'nd-icon-arrow-right',
}
export class Carousel extends pluginBase {
    /**
     * 绑定的字段
     **/
    autoplay: boolean;
    interval: number;
    width: string;
    height: string;
    length: number;
    carouselDom: HTMLElement;
    currentIndex: any;
    itemsDom: HTMLCollection;
    haveSlide: boolean;
    timer: NodeJS.Timeout;
    indicateDom: any;
    indicator: string;
    /**
     * 动画切换类型 updown fade
     */
    animation: string;
    /**
     * 箭头状态 none always 默认hover
     */
    arrow: string;
    /**
     * 切换时回调函数名
     */
    onchange: string | Function;

    constructor(params: Element|object, parent?: Element) {
        super(params);
        console.log(params);
        
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['width', 'height', 'autoplay|bool', 'interval|number', 'indicator', 'animation', 'arrow', 'onchange'],
                ['width', 'height', 'autoplay', 'interval', 'indicator', 'animation', 'arrow', 'onchange'],
                ['100%', '100%', true, 3000, 'inside', 'float', 'hover', '']
            );
        } else {
            if(typeof params=='object')
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
        UITool.setPops(dom, {
            indicator: this.indicator,
            anim: this.animation,
            arrow: this.arrow,
            style: 'width:' + this.width + ';height:' + this.height + ';'
        });
        dom.addEvent(new NEvent('mouseenter', () => {
            clearInterval(this.timer);
        }));
        dom.addEvent(new NEvent('mouseleave', () => {
            this.autoSlide();
        }));
        dom.addRenderOp(this.afterRender, 'after');
        dom.addRenderOp(this.beforeRender, 'before');
    };
    beforeRender(dom: Element, module: Module) {
         super.beforeRender(dom, module);
        let that = <Carousel>dom.defineEl;
        that.moduleId=module.id;
        dom.addClass('nd-carousel');
        if (dom.children.length > 0) {
            let elms = dom.children[0];
            elms.addClass('nd-carousel-item');
            let lBtn = new Element('button');
            let lIcon = new Element('span');
            lBtn.addClass(cls.arrow);
            lBtn.add(lIcon);
            lBtn.addEvent(new NEvent('click', function () {
                that.slide('sub');
            }));
            let rBtn = new Element('button');
            rBtn.setProp('nd-type', 'add');
            let rIcon = new Element('span');
            rBtn.add(rIcon);
            rBtn.addClass(cls.arrow);
            rBtn.addEvent(new NEvent('click', function () {
                that.slide('add');
            }));
            if (that.animation === 'updown') {
                lIcon.addClass(cls.iconUp);
                rIcon.addClass(cls.iconDown);
            } else {
                lIcon.addClass(cls.iconLeft);
                rIcon.addClass(cls.iconRight);
            }
            dom.add([lBtn, rBtn]);
        }
    }
    ;
    afterRender(dom: Element, module: Module) {
        // super.afterRender(dom, module);
        let that =  <Carousel>dom.defineEl;
        that.length = dom.children[0].children.length;
        let indicate = new Element('div');
        indicate.addClass('nd-carousel-ind');
        let ul = new Element('ul');
        for (let i = 0; i < that.length; i++) {
            let li = new Element('li');
            li.addEvent(new NEvent('click', () => {
                if (i > that.currentIndex) {
                    that.slide('add', i - that.currentIndex);
                } else if (i < that.currentIndex) {
                    that.slide('sub', that.currentIndex - i);
                }
            }))
            ul.add(li);
        };
        indicate.add(ul);
        dom.add(indicate);
        setTimeout(() => {
            that.currentIndex = 0;
            that.carouselDom = module.getNode(dom.key);
            let items: HTMLElement = that.carouselDom.querySelector('.nd-carousel-item');
            items.children[that.currentIndex].classList.add(cls.this);
            that.itemsDom = items.children;
            that.indicateDom = that.carouselDom.querySelector('.nd-carousel-ind').querySelectorAll('li');
            that.autoSlide();
        }, 50);
    }
    slide(type?: string, num?: number) {
        if (this.haveSlide)
            return;
        let ct = this.currentIndex, ctCls, ntCls;
        if (type === 'sub') {
            this.subIndex(num);
            ntCls = this.itemsDom[this.currentIndex].classList;
            ctCls = this.itemsDom[ct].classList;
            ntCls.add(cls.prev);
            setTimeout(() => {
                ctCls.add(cls.right);
                ntCls.add(cls.right);
            }, 50);
        } else {
            this.addIndex(num);
            ntCls = this.itemsDom[this.currentIndex].classList;
            ctCls = this.itemsDom[ct].classList;
            ntCls.add(cls.next);
            setTimeout(() => {
                ctCls.add(cls.left);
                ntCls.add(cls.left);
            }, 50);
        }
        //过渡
        setTimeout(() => {
            let del = [cls.left, cls.right, cls.prev, cls.next, cls.this];
            ntCls.remove(...del);
            ctCls.remove(...del);
            ntCls.add(cls.this);
            this.doChangeEvent(ct);
            this.haveSlide = false;
        }, 400);
        this.indicateDom[ct].classList.remove(cls.this);
        this.indicateDom[this.currentIndex].classList.add(cls.this);
        this.haveSlide = true;
    }
    doChangeEvent(ct: number) {
        if (this.onchange == '') {
            return;
        }
        let module: Module = ModuleFactory.get(this.moduleId);
        let func = typeof this.onchange == 'string' ? module.getMethod(this.onchange) : this.onchange;
        if (func) {
            func.call(this, ct, this.currentIndex, module);
        }
    }
    addIndex(num: number) {
        num = num || 1;
        this.currentIndex = (this.currentIndex + num) % this.length;
    }
    subIndex(num) {
        num = num || 1;
        this.currentIndex = this.currentIndex - num;
        if (this.currentIndex < 0)
            this.currentIndex = this.length - 1;
    }
    autoSlide() {
        if (!this.autoplay)
            return;
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.slide();
        }, this.interval || 3000);
    }

}
DefineElementManager.add('UI-CAROUSEL', {
    init: function (element: Element, parent?: Element) {
        new Carousel(element);
    }
});
