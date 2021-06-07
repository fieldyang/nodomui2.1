import { Compiler, DefineElementManager, Directive, Element, Expression, Filter, Model, Module, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 *   let ui = new UIListTransfer({
            dataName: 'selectedUser',
            listField: 'users',
            valueField: 'uid',
            displayField: "userName"
        })
 */

/** 带自定义的
  let ui = new UIListTransfer({
            dataName: 'selectedUser',
            listField: 'users',
            valueField: 'uid',
            displayField: "userName",
            customTemplate: `
                <div>
                    <span style="width: 100px; display: inline-block">{{userName}}</span>
                    <span>{{company}}</span>
                </div>
            `
        })
 */
interface IUIListTransfer extends Object {

    /**
     * 绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 列表项显示字段名（显示在content输入框）
     */
    displayField: string;
    /**
    * 自定义模板串 用于通过配置生成list
    */
    customTemplate?: string;

}


/**
 * list元素移动插件
 */
export class UIListTransfer extends pluginBase {
    tagName: string = 'UI-LISTTRANSFER';

    /**
     * 附加数据项名
     */
    extraDataName: string;
    /**
     * 绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 列表项显示字段名（显示在content输入框）
     */
    displayField: string;

    /**
    * 自定义模板串 用于通过配置生成list
    */
    customTemplate: string;

    constructor(params: Element | IUIListTransfer, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params
            UITool.handleUIParam(element, this,
                ['valuefield', 'displayfield', 'listfield'],
                ['valueField', 'displayField', 'listField']);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
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
        this.extraDataName = '$ui_listtransfer_' + Util.genId();

        //更改model
        // rootDom.addDirective(new Directive('model', this.extraDataName, rootDom));

        rootDom.addClass('nd-listtransfer');
        //从field指令获取dataName
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
        }
        //左列表
        let listDom: Element = new Element('div');
        listDom.addClass('nd-list');
        // 列表节点
        let itemDom: Element;

        if (this.customTemplate && this.customTemplate != '') {
            // 通过new 对象的方式传入模板串来自定义
            itemDom = Compiler.compile(this.customTemplate);
            rootDom.children = [itemDom];
        } else {
            // 写模板的时候就写在模板里面了
            // 如果有，则表示自定义
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
            let txt: Element = new Element();
            txt.expressions = [new Expression(this.displayField)];
            itemDom.add(txt);
        }
        itemDom.addClass('nd-list-item');

        new Directive('repeat', this.extraDataName + '.datas', itemDom, undefined, "select:value:{isValue:false}");
        new Directive('class', "{'nd-list-item-active':'selected'}", itemDom);
        //点击事件
        itemDom.addEvent(new NEvent('click',
            function (dom, module) {
                this.selected = !this.selected;
            }
        ));
        //item文本显示内容
        let item: Element = new Element('div');
        item.children = itemDom.children;
        item.addClass('nd-list-itemcontent');

        //选中图标
        let icon: Element = new Element('b');
        icon.addClass('nd-list-icon');
        // new Directive('class', `{'nd-list-icon':'selected==true'}`, icon);
        itemDom.children = [item, icon];

        listDom.children = [itemDom];

        //右列表(克隆来)
        let listDom1: Element = listDom.clone(true);
        //更改数据
        listDom1.children[0].getDirective('repeat').filters = [new Filter("select:value:{isValue:true}")];

        //按钮>>
        //按钮容器
        let btnGrp: Element = new Element('div');
        btnGrp.addClass('nd-listtransfer-btngrp');
        //按钮>>
        let btn1: Element = new Element('b');
        btn1.addClass('nd-listtransfer-right2');
        //按钮>
        let btn2: Element = new Element('b');
        btn2.addClass('nd-listtransfer-right1');
        //按钮<
        let btn3: Element = new Element('b');
        btn3.addClass('nd-listtransfer-left1');
        //按钮<<
        let btn4: Element = new Element('b');
        btn4.addClass('nd-listtransfer-left2');
        btnGrp.children = [btn1, btn2, btn3, btn4];

        btn1.addEvent(new NEvent('click', (dom, module, e) => {
            me.transfer(module, 1, true);
        }));
        btn2.addEvent(new NEvent('click', (dom, module, e) => {
            me.transfer(module, 1, false);
        }));
        btn3.addEvent(new NEvent('click', (dom, module, e) => {
            me.transfer(module, 2, false);
        }));
        btn4.addEvent(new NEvent('click', (dom, module, e) => {
            me.transfer(module, 2, true);
        }));

        rootDom.children = [listDom, btnGrp, listDom1];

    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        //module model
        let model: Model = this.model;
        // new Directive('model', "$$", dom)
        if (this.needPreRender) {
            model[this.extraDataName] = {
                //数据
                datas: []
            }
            let datas = model[this.listField];
            model[this.extraDataName].datas = datas;
        }
        this.setValueSelected(module);
    }

    /**
     * 设置选中
     * @param module 
     */
    private setValueSelected(module: Module) {
        let pmodel: Model = this.model;
        let value = pmodel[this.dataName];
        let va = value.split(',');
        let rows = pmodel[this.extraDataName].datas;
        for (let d of rows) {
            if (va && va.includes(d[this.valueField] + '')) {
                d.isValue = true;
            } else {
                d.isValue = false;
            }
        }
        pmodel[this.extraDataName].datas = rows;
    }
    /**
     * 移动数据
     * @param module    模块
     * @param direction 移动方向 1右移 2左移
     * @param all       true 全部移动  false 移动选中的项
     */
    private transfer(module: Module, direction: number, all: boolean) {
        let model: Model = this.model;
        let datas = model[this.extraDataName].datas;
        let isValue: boolean = direction === 1 ? true : false;
        for (let d of datas) {
            if (all) {
                d.isValue = isValue;
            } else if (d.selected) {
                d.isValue = isValue;
            }
            d.selected = false;
        }
        this.updateValue(module);
    }

    /**
     * 更新字段值
     * @param module    模块
     */
    private updateValue(module: Module) {
        let pmodel: Model = this.model;
        let a = [];
        for (let d of pmodel[this.extraDataName].datas) {
            if (d.isValue) {
                a.push(d[this.valueField]);
            }
        }
        pmodel[this.dataName] = a.join(',');
    }
}

DefineElementManager.add('UI-LISTTRANSFER', {
    init: function (element: Element, parent?: Element) {
        new UIListTransfer(element, parent);
    }
});
