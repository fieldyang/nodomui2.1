/*
 * @Author: kyleslie 
 * @Date: 2021-07-22 21:13:56 
 * @Last Modified by: kyleslie
 * @Last Modified time: 2021-07-22 21:17:50
 */
import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
export class Switch extends pluginBase {
    /**
     * 绑定的字段
     **/
    dataField: string = '';
    /**
     * 开关大小，默认正常，可选small
     */
    size: string = '';
    /**
     * 活跃状态时显示的文本
     */
    checkedText: string;
    /**
     * 非活跃状态时显示的文本
     */
    uncheckedText: string;

    /**
     * 插件状态，true/false
     */
    checked: boolean;
    /**
     * 绑定的model
     */
    extraModel: Model;
    /**
     * 是否禁用
     */
    disabled: any;
    /**
     * 使用icon
     */
    useIcon: boolean;
    /**
     * 状态改变后调用的回调函数
     */
    onChange: string|Function;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['datafield', 'size', 'disabled|bool', 'checked|bool', 'checkedtext', 'uncheckedtext', 'onchange', 'useicon'],
                ['dataField', 'size', 'disabled', 'checked', 'checkedText', 'uncheckedText', 'onChange', 'useIcon'],
                ['', 'default', false, false, '', '', '', false]
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
        element.addClass('nd-switch');
        if (this.size === 'small') {
            element.addClass('nd-switch-small');
        };
        this.dataField = '$switchState' + Util.genId();
        let handle: Element = new Element('div');
        handle.addClass('nd-switch-handle');
        element.add(handle);
        let inner: Element;
        if (this.useIcon) {
            inner = new Element('b');
            new Directive('class', '{"nd-icon-select":"' + this.dataField + '","nd-icon-cross":"!'+this.dataField+'"}', inner, element);
        } else {
            if (this.checkedText !== '' && this.uncheckedText !== '') {
                inner = new Element('span');
                let text: Element = new Element();
                text.expressions = [new Expression('switchJudge(' + this.dataField + ')')]
                inner.add(text);
            }
        }
        if(inner!=undefined){
            inner.addClass('nd-switch-inner');
            element.add(inner);
        }
        new Directive('class', '{"nd-switch-checked":"' + this.dataField + '"}', element);
        if (this.disabled) {
            element.addClass('nd-switch-disable');
        } else {
            element.addEvent(new NEvent('click', function (dom, module, e, el) {
                that.checked = this[that.dataField] = !that.checked;
                that.doChangeEvent(that.checked,module,this);
            }));
        }
        element.addRenderOp(this.beforeRender, 'before');
        // element.addRenderOp(this.afterRender, 'after');
    };
    beforeRender(dom: Element, module: Module) {
        super.beforeRender.call(dom.defineEl, dom, module);
        let that = <Switch>dom.defineEl;
        that.extraModel = dom.model = new Model({
            [that.dataField]: that.checked,
            ['switchJudge']: (data) => {
                return data ? that.checkedText : that.uncheckedText;
            }
        }, module);
    };
    // afterRender(dom: Element, module: Module) {
    //     super.afterRender.call(dom.defineEl, dom, module);
    // }
    doChangeEvent(checked:boolean,module:Module,model:Model){
        if (this.onChange == '') {
            return;
        }
        let func = typeof this.onChange == 'string' ? module.getMethod(this.onChange) : this.onChange;
        if (func) {
            func.call(this, checked,module,model);
        }
    }
}
DefineElementManager.add('UI-SWITCH', {
    init: function (element: Element, parent?: Element) {
        new Switch(element);
    }
});
