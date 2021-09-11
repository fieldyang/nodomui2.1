/*
 * @Author: kyleslie 
 * @Date: 2021-07-23 09:29:35 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-07-25 10:17:31
 */

import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager, Util, FilterManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
export class Timeline extends pluginBase {
    /**
     * 模式
     */
    mode:string;
   /** 
     * 使用icon
     */
    ending: boolean;
    /**
     * 状态改变后调用的回调函数
     */
    onChange: string | Function;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['ending|bool','mode'],
                ['ending','mode'],
                [true,'']
            );
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.init(rootDom);
        rootDom.tagName = 'ul';
        rootDom.defineEl = this;
        this.element = rootDom;
        
    }
    init(element: Element) {
        if (element.children.length > 0) {
            let chd: Array<Element> = [];
            element.children.reduce((v, num) =>
                (num.tagName == 'timeline-item' && (v.push(num)), v)
                , chd);
            chd.forEach((v) => {
                v.tagName='li';
                v.addClass('nd-timeline-item');
                let i: Element = new Element('i');
                i.addClass('nd-timeline-axis');
                if (v.hasProp('icon')) {
                    i.addClass(v.getProp('icon'));
                    v.delProp('icon');
                } else {
                    i.addClass('nd-icon-radio');
                }
                if(v.hasProp('color')){
                    i.addClass('nd-color-'+v.getProp('color'));
                    v.delProp('color');
                } 
                v.add(i);
                let content=new Element('div');
                content.addClass('nd-timeline-content');
                content.children = v.children.reduce((v, item) => {
                    if (item.tagName == 'item-title') {
                        item.tagName = this.mode=='ease'?'div':'h3';
                        item.addClass('nd-timeline-title');
                        v.push(item)
                    } else if (item.tagName == 'item-text') {
                        item.tagName = 'p';
                        v.push(item);
                    }
                    return v;
                },[]);
               
                v.children=[i,content];
            })
            element.children=chd;
            if(this.ending){
                console.log(  element.children.slice(-1)[0]);
                element.children.slice(-1)[0].setProp('timeline-end','');
             }
        }
        
        element.addClass('nd-timeline');
        element.addRenderOp(this.beforeRender, 'before');
        // element.addRenderOp(this.afterRender, 'after');
    };
}
DefineElementManager.add('UI-TIMELINE', {
    init: function (element: Element, parent?: Element) {
        new Timeline(element);
    }
});
