/*
 * @Author: kyleslie 
 * @Date: 2021-06-28 16:35:34 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-07-29 16:41:21
 */

import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
export class Progress extends pluginBase {
    /**
     * 绑定的字段
     **/
    dataField: string = '';
    /**真实长度 */
    realWidth: string;
    /**
     * 进度条的key
     */
    barKey: string;
    /**
     * 进度条大小，默认小
     */
    size: string = '';
    /**
     * 进度条的颜色，默认墨绿色
     */
    color: string;
    /**
     * 是否展示文本，默认展示
     */
    showText: boolean;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['datafield', 'size', 'color', 'showtext|bool'],
                ['dataField', 'size', 'color', 'showText'],
                ['', '', 'green', true]
            );
        } else {
            if(typeof params==='object')
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
        element.addClass('nd-progress');
        if (this.size === 'big') {
            element.addClass('nd-progress-big');
        }
        let bar: Element = new Element('div');
        bar.addClass('nd-progress-bar');
        bar.addClass('nd-bg-' + this.color);
        this.barKey = bar.key;
        if (this.showText) {
            let tip: Element = new Element('span');
            tip.addClass('nd-progress-text');
            let showText: Element = new Element();
            showText.expressions = [new Expression(`(${this.dataField}||"0%")|number:3`)];
            tip.add(showText);
            bar.add(tip);
        }
        element.add(bar);
        element.addRenderOp(this.beforeRender, 'before');
        element.addRenderOp(this.afterRender, 'after');
    };
    beforeRender(dom: Element, module: Module) {
        // super.beforeRender.call(dom.defineEl,dom, module);
        let that = <Progress>dom.defineEl;
        let pd = dom.model;
        let value = pd.$query(that.dataField);
        that.realWidth = value ? that.handWidth(value + '') : '0%';
        dom.query(that.barKey).setProp('style', 'width:' + that.realWidth);
    };
    afterRender(dom: Element, module: Module) {
    //  super.afterRender.call(dom.defineEl,dom, module);
        let that = <Progress>dom.defineEl;
        if (that.showText) {
            let text = dom.query({
                tagName: 'span',
            });
            text.children[0].textContent = that.realWidth;
        }
    }
    private handWidth(value) {
        return /^.+\/.+$/.test(value)
            ? (new Function('return ' + value)().toFixed(4) * 100) + '%'
            : (value + '').indexOf('%') == -1 ? value + '%' : value;
    }
}
DefineElementManager.add('UI-PROGRESS', {
    init: function (element: Element, parent?: Element) {
        new Progress(element);
    }
});
