import { DefineElementManager, Directive, Element, Expression, Model, Module, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

interface IUIRadio {
    /**
     * 数据项名
     */
    dataName: string;

    /**
     * 显示数据项名
     */
    displayField: string;

    /**
     * 值数据项名
     */
    valueField: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 选择项的左右margin值
     */
    itemMargin?: number;

}

/**
 * redio
 */
export class UIRadio extends pluginBase {
    tagName: string = 'UI-RADIO';

    /**
     * 数据项名
     */
    dataName: string;

    /**
     * 显示数据项名
     */
    displayField: string;

    /**
     * 值数据项名
     */
    valueField: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 选择项的左右margin值
     */
    itemMargin: number;
    /**
     * 选中字段名，选择项产生方式为数据，则会自动生成，为自定义，则不生成
     */
    checkName: string;

    constructor(params: Element | IUIRadio, parent?: Element) {
        super(params);
        let element = new Element()
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['valuefield', 'displayfield', 'listfield', 'itemmargin|number'],
                ['valueField', 'displayField', 'listField', 'itemMargin'],
                ['', '', '', 5]);
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
        rootDom.addClass('nd-radio');

        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }

        // 通过配置项生成选择项
        // this.valueField !== '' && this.displayField !== '' && this.listField !== ''
        if (genMode === false) {
            //自定义checkname
            this.checkName = '$ui_radio_' + Util.genId();
            let item: Element = new Element('span');
            item.setProp('value', new Expression(this.valueField), true);
            let icon: Element = new Element('b');
            icon.addClass('nd-radio-unactive');
            icon.addDirective(new Directive('class', "{'nd-radio-active':'" + this.checkName + "'}", icon));
            item.add(icon);
            let txt = new Element();
            txt.expressions = [new Expression(this.displayField)];
            item.add(txt);
            let directive: Directive = new Directive('repeat', this.listField, item);
            item.addDirective(directive);
            item.assets.set('style', 'margin:0 ' + this.itemMargin + 'px;');
            item.addEvent(new NEvent('click',
                (dom, module) => {
                    let model1: Model = module.model;

                    let datas: Array<object> = model1[this.listField];
                    // 所有选项的select置false
                    if (datas) {
                        for (let d of datas) {
                            d[this.checkName] = false;
                        }
                    }
                    //当前点击项置true
                    model1[this.checkName] = true;
                    //修改实际数据项
                    model1[this.dataName] = dom.getProp('value');
                }
            ));
            rootDom.children = [item];
        } else { //通过子节点生成选择项
            for (let c of rootDom.children) {
                if (c.tagName) {
                    let icon: Element = new Element('b');
                    icon.addClass('nd-radio-unactive');
                    icon.addDirective(new Directive('class', "{'nd-radio-active':'" + this.dataName + "==\"" + c.getProp('value') + "\"'}", icon));
                    c.children.unshift(icon);
                    //点击事件
                    c.addEvent(new NEvent('click',
                        (dom, module) => {
                            dom.model[this.dataName] = dom.getProp('value');
                        }
                    ));
                }
            }
        }
    }

    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        let model = module.model;
        if (this.checkName) {
            let datas: Array<object> = model[this.listField];
            if (datas) {
                for (let d of datas) {
                    if (model[this.dataName] == d[this.valueField]) {
                        d[this.checkName] = true;
                    } else {
                        d[this.checkName] = false;
                    }
                }
            }
        }
    }
}

DefineElementManager.add('UI-RADIO', {
    init: function (element: Element, parent?: Element) {
        new UIRadio(element, parent)
    }
});
