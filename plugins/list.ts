import { Compiler, DefineElementManager, Directive, Element, Expression, Model, Module, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

interface IUIList extends Object {
    /**
    * 绑定数据域名
    */
    dataName?: string;

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
     * disable数据项名
     */
    disableName?: string;

    /**
     * 类型
     */
    type?: string;

    /**
     * item宽度
     */
    itemWidth?: number;

    /**
     * click 事件名
     */
    clickEvent: string;

    /**
     * 是否多选
     */
    multiSelect?: boolean;

    /**
     * 自定义模板串 用于通过配置生成list
     */
    customTemplate?: string;
}

/**
 * panel 插件
 */
export class UIList extends pluginBase {
    tagName: string = 'UI-LIST';

    /**
     * 绑定数据域名
     */
    dataName: string;
    /**
     * 附加数据项名
     */
    extraDataName: string;

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
     * disable数据项名
     */
    disableName: string;

    /**
     * 类型
     */
    type: string;

    /**
     * item宽度
     */
    itemWidth: number;

    /**
     * click 事件名
     */
    clickEvent: string;

    /**
     * 是否多选
     */
    multiSelect: boolean;

    /**
     * 自定义模板串 用于通过配置生成list
     */
    customTemplate: string;

    constructor(params: Element | IUIList, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;

            UITool.handleUIParam(element, this,
                ['valuefield', 'displayfield', 'disablefield', 'listfield', 'type', 'itemclick', 'itemwidth|number', 'multiselect|bool'],
                ['valueField', 'displayField', 'disableName', 'listField', 'type', 'clickEvent', 'itemWidth', 'multiSelect'],
                ['', '', '', null, 'row', '', 0, null]);

        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key];
            })
        }

        this.generate(element);
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        let me = this;
        //生成id
        this.extraDataName = '$ui_list_' + Util.genId();

        //增加附加model
        rootDom.addDirective(new Directive('model', this.extraDataName, rootDom));
        if (this.type === 'row') {
            rootDom.addClass('nd-list');
        } else {
            rootDom.addClass('nd-list-horizontal');
        }

        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }

        // 列表节点
        let itemDom: Element;

        if (this.customTemplate && this.customTemplate !== '') {
            // 通过配置的方式产生自定义
            itemDom = Compiler.compile(this.customTemplate);
            rootDom.children = [itemDom];
        } else {
            // 如果有，则表示在写模板的时候就传入了自定义元素
            for (let c of rootDom.children) {
                if (!c.tagName) {
                    continue;
                }
                itemDom = c;
                break;
            }
        }

        //非自定义，则新建默认对象
        if (!itemDom) {
            itemDom = new Element('div');
            if (this.displayField !== '') {
                let txt: Element = new Element();
                txt.expressions = [new Expression(this.displayField)];
                itemDom.add(txt);
            }
        }
        itemDom.addClass('nd-list-item');
        itemDom.addDirective(new Directive('repeat', 'datas', itemDom));
        //点击事件
        itemDom.addEvent(new NEvent('click',
            (dom, module) => {
                if (me.disableName !== '' && dom.model[me.disableName]) {
                    return;
                }
                me.setValue(module, dom.model);
            }
        ));
        //列表方式，需要设置不同元素
        if (this.type === 'row') {
            //item文本显示内容
            let item: Element = new Element('div');
            item.children = itemDom.children;
            item.addClass('nd-list-itemcontent');

            let icon: Element = new Element('b');
            icon.addClass('nd-list-icon');
            itemDom.children = [item, icon];
        }

        if (this.disableName !== '') {
            itemDom.addDirective(new Directive('class', "{'nd-list-item-active':'selected','nd-list-item-disable':'" + this.disableName + "'}", itemDom));
        } else {
            itemDom.addDirective(new Directive('class', "{'nd-list-item-active':'selected'}", itemDom));
        }

        //点击事件
        if (this.clickEvent) {
            itemDom.addEvent(new NEvent('click', this.clickEvent));
        }
        rootDom.children = [itemDom];
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        //uidom model
        let pmodel: Model;
        //附加数据model
        let model;
        if (this.needPreRender) {
            pmodel = module.model;
            pmodel[this.extraDataName] = {
                datas: []        //下拉框数据
            }
        }

        if (!pmodel) {
            pmodel = module.model;
        }

        if (!model) {
            model = pmodel[this.extraDataName];
        }

        let data = model.datas;
        //下拉值初始化
        if (this.listField && data.length === 0 && pmodel[this.listField]) {
            let valueArr: string[];
            if (this.dataName) {
                let value = pmodel[this.dataName];
                if (value && value !== '') {
                    valueArr = value.toString().split(',');
                }
            }

            let rows = pmodel[this.listField];
            //复制新数据
            if (rows && Array.isArray(rows)) {
                rows = Util.clone(rows);

                //初始化选中状态
                if (this.valueField !== '') {
                    for (let d of rows) {
                        if (valueArr && valueArr.includes(d[this.valueField] + '')) {
                            d.selected = true;
                        } else {
                            d.selected = false;
                        }
                    }
                }

                //设置下拉数据
                model.datas = rows;
                this.setValue(module);
            }
        }
    }

    /**
     * 设置数据
     * @param module    模块
     * @param value     值
     */
    setValue(module: Module, model?: Model) {
        //原model
        let pmodel = module.model;
        //附加数据model
        let model1 = pmodel[this.extraDataName];
        let rows = model1.datas;
        //显示数组
        //值数组
        let valArr: string[] = [];
        if (this.multiSelect) {
            //反选
            if (model) {
                model['selected'] = !model['selected'];
            }

            if (this.valueField !== '' && this.dataName) {
                for (let d of rows) {
                    if (d.selected) {
                        valArr.push(d[this.valueField]);
                    }
                }
                pmodel[this.dataName] = valArr.join(',');
            }
        } else {
            //如果model不存在，则直接取选中值
            if (model) {
                //取消选择
                for (let d of rows) {
                    if (d.selected) {
                        d.selected = false;
                        break;
                    }
                }
                //设置选择
                model['selected'] = !model['selected'];
            }


            //设置选中
            for (let d of rows) {
                if (d.selected) {
                    if (this.valueField !== '' && this.dataName) {
                        pmodel[this.dataName] = d[this.valueField];
                    }
                    break;
                }
            }
        }
    }
}

DefineElementManager.add('UI-LIST', {
    init: function (element: Element, parent?: Element) {
        new UIList(element, parent);
    }
});
