/*
 * @Author: kyleslie 
 * @Date: 2021-06-28 16:36:20 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-08-04 20:47:41
 */
import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
export class Rate extends pluginBase {
    /**
     * 长度
     */
    length: number;
    /**
     * 绑定的字段
     **/
    dataField: string;
    /**
     * 是否只读
     */
    readonly: boolean = false;

    level: number;
    element:Element
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['length', 'datafield', 'readonly'],
                ['length', 'dataField', 'readonly'],
                [5, '', false]
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
    init(element: Element) {
        let that = this;
        let ul: Element = new Element('ul');
        ul.addClass('nd-rate');
        let chd: Array<Element> = new Array();
        for (let i = 0; i < this.length; i++) {
            let star = new Element('li');
            star.addClass('nd-inline');
            let item = new Element('i');
            item.addClass('nd-rate-item');
            if (!this.readonly) {
                star.addEvent(new NEvent('mouseover', function (dom, module, e, el: any) {
                    let prev = el, next = el.nextElementSibling;
                    while (prev != null) {
                        let chd = prev.children[0].classList;
                        if (chd.contains('nd-icon-collect-fill'))
                            break;
                        chd.remove('nd-icon-collect');
                        chd.add('nd-icon-collect-fill');
                        prev = prev.previousElementSibling;
                    };
                    while (next != null) {
                        let chd = next.children[0].classList;
                        if (chd.contains('nd-icon-collect'))
                            break;
                        chd.remove('nd-icon-collect-fill');
                        chd.add('nd-icon-collect');
                        next = next.nextElementSibling;
                    }
                }));
                star.addEvent(new NEvent('click', function (dom, module, e, el) {
                    this[that.dataField] = i + 1;
                }));
            };
            star.add(item);
            chd.push(star);
        };
        ul.children = chd;
        if (!this.readonly) {
            element.addEvent(new NEvent('mouseout', (dom, module, e, el: any) => {
                    let lis = el.querySelectorAll('i');
                    for (let i = 0; i < lis.length; i++) {
                        let cls = lis[i].classList;
                        if (i < this.level) {
                            cls.remove('nd-icon-collect');
                            cls.add('nd-icon-collect-fill');
                        } else {
                            cls.remove('nd-icon-collect-fill');
                            cls.add('nd-icon-collect');
                        }
                    };
               
            }));
        }
        element.add(ul);
        let text = new Element('span');
        let comment = new Element();
        comment.expressions = [new Expression('Math.floor(' + this.dataField + ')' + '||0'), '星'];
        text.addClass('nd-inline');
        text.add(comment);
        element.add(text);
        element.addRenderOp(this.beforeRender, 'before');
        element.addRenderOp(this.afterRender, 'after');
    };
    beforeRender(dom: Element, module: Module) {
        // super.beforeRender(dom, module);
    };
    afterRender(dom: Element, module: Module) {
        // super.afterRender(dom, module);
        let that =<Rate>dom.defineEl;
        let model = dom.model;
        let level = model.$query(that.dataField) || 0;
        let stars = dom.query({
            tagName: 'ul',
        });
        if (typeof level === 'string') {
            level = parseInt(level);
        } else if (typeof level === 'number') {
            that.level = level > 0 ? Math.round(level) : 0;
        }
        stars.children.forEach((star, index) => {
            if (index < level) {
                star.children[0].addClass('nd-icon-collect-fill');
            } else {
                star.children[0].addClass('nd-icon-collect');
            }
        });
    }
}
DefineElementManager.add('UI-RATE', {
    init: function (element: Element, parent?: Element) {
        new Rate(element);
    }
});
