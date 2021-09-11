import { DefineElementManager, Directive, Element, Expression, Model, Module, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
        let ui = new UIRelationMap({
            dataName: 'groupUser',
            listField: ['users', 'groups'],
            valueField: ['uid', 'gid'],
            displayField: ["userName", "groupName"]
        })
 */

interface IUIRelationMap extends Object {
    /**
    * 值名数组 [xname,yname]
    */
    valueField: string[];

    /**
     * 显示名数组 [xname,yname]
     */
    displayField: string[];
    /**
     * 数据名数组 [xname,yname]
     */
    listField: string[];
    /**
     * 绑定数据名
     */
    dataName: string;
}


/**
 * relation map 插件
 * 配置
 *  field 绑定数据项名，数据格式为[{列数据id名:值1,行数据id名:值2},...]
 *  datas='列数据名,行数据名'  
 *  valueField='列数据id名,行数据id名' 
 *  showFields='列数据显示数据项名,行数据显示数据项名'
 */
export class UIRelationMap extends pluginBase {
    tagName: string = 'UI-RELATIONMAP';
    /**
     * 值名数组 [xname,yname]
     */
    valueField: string[];

    /**
     * 显示名数组 [xname,yname]
     */
    displayField: string[];
    /**
     * 数据名数组 [xname,yname]
     */
    listField: string[];
    /**
     * 绑定数据名
     */
    dataName: string;

    /**
     * map数据名
     */
    mapName: string;

    constructor(params: Element | IUIRelationMap, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['valuefield|array|1', 'displayfield|array|2', 'listfield|array|2'],
                ['valueField', 'displayField', 'listField'],
                [null, null, null]);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.generate(element);

        element.tagName = 'table';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        let me = this;
        rootDom.addClass('nd-relationmap');
        this.mapName = '$ui_relationmap_' + Util.genId();
        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
        }
        //横行头
        let rowHead: Element = new Element('tr');
        rowHead.addClass('nd-relationmap-head');
        rootDom.add(rowHead);

        //第一个空白
        let td: Element = new Element('td');
        rowHead.add(td);
        //列数td
        td = new Element('td');
        new Directive('repeat', this.listField[0], td);
        let txt: Element = new Element();
        txt.expressions = [new Expression(this.displayField[0])];
        td.add(txt);
        rowHead.add(td);

        //行元素
        let tr: Element = new Element('tr');
        new Directive('repeat', this.listField[1], tr);
        tr.addClass('nd-relationmap-row');
        td = new Element('td');
        td.addClass('nd-relationmap-head');
        txt = new Element();
        txt.expressions = [new Expression(this.displayField[1])];
        td.add(txt);
        tr.add(td);

        td = new Element('td');

        new Directive('repeat', 'cols', td);

        td.addEvent(new NEvent('click',
            (dom: Element, module: Module) => {
                me.switchValue(module, dom);
            }
        ));

        //按钮
        let b: Element = new Element('b');
        new Directive('class', "{'nd-relationmap-active':'active'}", b);
        td.add(b);
        tr.add(td);
        rootDom.children = [rowHead, tr];

    }

    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(uidom: Element, module: Module,) {
        super.beforeRender(uidom, module);
        //增加列表格渲染数据
        let model: Model = this.model;

        let rowData = model[this.listField[1]];
        if (!rowData) {
            return;
        }
        let colData = model[this.listField[0]];
        if (!colData) {
            return;
        }
        let data = model[this.dataName];
        let idRow = this.valueField[1];
        let idCol = this.valueField[0];
        let mapData = [];
        let title: string;
        for (let d of rowData) {
            let a1 = [];
            let id1 = d[idRow];
            title = d[this.displayField[1]];
            for (let d1 of colData) {
                let active: boolean = false;
                if (data && data.length > 0) {
                    for (let da of data) {
                        if (da[idRow] === id1 && da[idCol] === d1[idCol]) {
                            active = true;
                            break;
                        }
                    }
                }
                a1.push({
                    id1: id1,
                    id2: d1[idCol],
                    active: active
                });
            }
            Object.assign(d, { title: title, cols: a1 })
            // d.push({ title: title, cols: a1 });
        }
        model[this.mapName] = mapData;

    }

    /**
     * 切换选中状态
     * @param module 
     * @param dom 
     * @param model 
     */
    switchValue(module: Module, dom: Element) {
        let model: Model = this.model;
        let data = model[this.dataName];
        let id1 = dom.model['id1'];
        let id2 = dom.model['id2'];
        let active = dom.model['active'];
        let o = {};
        o[this.valueField[0]] = id2;
        o[this.valueField[1]] = id1;
        if (!data) {
            if (!active) {
                model[this.dataName] = [o];
            }
        } else {
            //添加
            if (!active) {
                data.push(o);
            } else { //删除
                for (let i = 0; i < data.length; i++) {
                    let d = data[i];
                    if (d[this.valueField[0]] === id2 && d[this.valueField[1]] === id1) {
                        data.splice(i, 1);
                        break;
                    }
                }
            }
        }
        model['active'] = !active;
    }
}

DefineElementManager.add('UI-RELATIONMAP', {
    init: function (element: Element, parent?: Element) {
        new UIRelationMap(element, parent)
    }
});
