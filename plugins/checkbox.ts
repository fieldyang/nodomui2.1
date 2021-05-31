import { Compiler, DefineElementManager, Directive, Element, NEvent } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

interface IUICheckboxCfg extends Object {

    /**
     * 数据项字段名
     */
    dataName: string;

    /**
     * checkbox 选中值
     */
    yesValue: string;

    /**
     * checkbox 未选中值
     */
    noValue: string;
    /**
     * checkbox后面的文字
     */
    text?: string;
}


/**
 * checkbox
 */
export class UICheckbox extends pluginBase {
    tagName: string = 'UI-CHECKBOX';

    /**
     * 数据项字段名
     */
    dataName: string;

    /**
     * checkbox 选中值
     */
    yesValue: string;

    /**
     * checkbox 未选中值
     */
    noValue: string;
    /**
     * checkbox后面的文字
     */
    text: string;

    constructor(params: Element | IUICheckboxCfg, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params
            UITool.handleUIParam(element, this,
                ['yesvalue', 'novalue'],
                ['yesValue', 'noValue'],
                ['true', 'false']
            );
            this.generate(element, true);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
            this.generate(element, false);
        }
        element.tagName = 'span';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 生成插件的内容
     * @param rootDom 插件产生的虚拟dom
     * @param genMode 生成虚拟dom的方式，true:ast编译的模板的方式，false:传入配置对象的方式
     */
    private generate(rootDom: Element, genMode: boolean) {
        if (genMode === true) {
            let field = rootDom.getDirective('field');
            if (field) {
                this.dataName = field.value;
                rootDom.removeDirectives(['field']);
            }
        } else {
            let txt = new Element();
            if (this.text && this.text != '') {
                // checkbox后面的文字节点可能是个裸的表达式所以这里要用Expression处理
                let expr = Compiler.compileExpression(this.text);
                if (typeof expr === 'string') {
                    txt.textContent = this.text;
                } else {
                    txt.expressions = expr;
                }
                rootDom.children.push(txt);
            }
        }
        let icon: Element = new Element('b');
        icon.addClass('nd-checkbox-uncheck');
        new Directive('class', "{'nd-checkbox-checked':'" + this.dataName + "==\"" + this.yesValue + "\"'}", icon);
        rootDom.children.unshift(icon);

        //点击事件
        rootDom.addEvent(new NEvent('click',
            (dom, module, e) => {
                console.log(dom);

                let v = dom.model[this.dataName];
                if (v == this.yesValue) {
                    dom.model[this.dataName] = this.noValue;
                } else {
                    dom.model[this.dataName] = this.yesValue;
                }
            }
        ));

    }
}

DefineElementManager.add('UI-CHECKBOX', {
    init: function (element: Element, parent?: Element) {
        new UICheckbox(element, parent)
    }
});
