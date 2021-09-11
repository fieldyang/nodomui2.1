import { DefineElementManager, Directive, Element, Expression, Model, Module, ModuleFactory, NEvent, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 * TREE 插件
 */
class UITree extends pluginBase {
    tagName: string = 'UI-TREE';

    /**
     * 左侧箭头点击事件id
     */
    arrowClickId: string;
    /**
     * 数据项字段名
     */
    dataName: string;
    /**
     * 激活字段名
     */
    activeName: string;

    /**
     * item点击事件
     */
    itemClick: string;

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
     * 最大级数
     */
    maxLevel: number;

    /**
     * 选中数据名
     */
    checkName: string;

    /**
     * 选中子节点数
     */
    checkedChdNumName: string;

    /**
     * icon 数组 第一个为非叶子节点icon，第二个为叶子节点icon
     */
    iconArr: string[];
    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['valuefield', 'displayfield', 'listfield', 'itemclick', 'checkname', 'maxlevel|number', 'icons|array|2'],
            ['valueField', 'displayField', 'listField', 'itemClick', 'checkName', 'maxLevel', 'iconArr'],
            ['', null, null, '', '', 3, []]);
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
        const me = this;

        rootDom.addClass('nd-tree');

        this.activeName = '$ui_tree_' + Util.genId();
        this.checkedChdNumName = '$ui_tree_' + Util.genId();

        //展开收拢事件
        let methodId = '$nodomGenMethod' + Util.genId();
        this.arrowClickId = methodId;
        let closeOpenEvent: NEvent = new NEvent('click', methodId);

        //item click 事件
        let itemClickEvent: NEvent;
        if (this.itemClick !== '') {
            itemClickEvent = new NEvent('click', this.itemClick);
        }
        let parentCt: Element = rootDom;
        let item: Element;
        for (let i = 0; i < this.maxLevel; i++) {
            let itemCt: Element = new Element();
            itemCt.tagName = 'div';
            itemCt.directives.push(new Directive('repeat', this.listField, itemCt));
            itemCt.addClass('nd-tree-nodect');
            item = new Element();
            item.addClass('nd-tree-node');
            item.tagName = 'DIV';
            //绑定item click事件
            if (itemClickEvent) {
                item.addEvent(itemClickEvent);
            }

            //icon处理
            //树形结构左边箭头图标
            let icon1 = new Element();
            icon1.tagName = 'SPAN';
            icon1.addClass('nd-tree-icon');
            icon1.addDirective(new Directive('class',
                "{'nd-tree-node-open':'" + this.activeName + "'," +
                "'nd-icon-right':'" + this.listField + "&&" + this.listField + ".length>0'}",
                icon1));

            //绑定展开收起事件
            icon1.addEvent(closeOpenEvent);
            itemCt.add(icon1);

            //folder和叶子节点图标
            if (this.iconArr.length > 0) {
                let a: string[] = [];

                a.push("'nd-icon-" + this.iconArr[0] + "':'" + this.listField + "&&" + this.listField + ".length>0'");
                //叶子节点图标
                if (this.iconArr.length > 1) {
                    a.push("'nd-icon-" + this.iconArr[1] + "':'!" + this.listField + "||" + this.listField + ".length===0'");
                }
                let icon: Element = new Element();
                icon.tagName = 'SPAN';
                icon.addClass('nd-tree-icon');
                let cls: string = '{' + a.join(',') + '}';
                icon.directives.push(new Directive('class', cls, icon));
                itemCt.add(icon);
            }

            if (this.checkName !== '') {
                let cb: Element = new Element('b');
                cb.addClass('nd-tree-uncheck');
                cb.addDirective(new Directive('class', "{'nd-tree-checked':'" + this.checkName + "'}", cb));
                itemCt.add(cb);
                cb.addEvent(new NEvent('click',
                    (dom, module, e) => {
                        me.handleCheck(dom.model, module);
                    }
                ));
            }

            itemCt.add(item);
            //显示文本
            let txt = new Element();
            txt.expressions = [new Expression(this.displayField)];
            item.add(txt);

            //子节点容器
            let subCt = new Element();
            subCt.addClass('nd-tree-subct');
            subCt.tagName = 'DIV';
            subCt.addDirective(new Directive('class', "{'nd-tree-show':'" + this.activeName + "'}", subCt));
            itemCt.add(subCt);
            parentCt.add(itemCt);
            parentCt = subCt;
        }

    }

    /**
     * 渲染前执行
     * @param module 
     */
    beforeRender(uidom: Element, module: Module,) {
        const me = this;
        super.beforeRender(uidom, module);
        if (this.needPreRender) {
            //展开收拢事件
            module.addMethod(me.arrowClickId,
                (dom, module, e) => {

                    let model: Model = module.model;
                    let rows = model[me.listField];
                    //叶子节点不处理
                    if (!rows || rows.length === 0) {
                        return;
                    }
                    //选中字段名
                    model[me.activeName] = !model[me.activeName];
                }
            );
        }
    }

    /**
    * 处理选中状态
    * @param data       当前dom的数据
    * @param module     模块
    */
    private handleCheck(model: Model, module: Module) {
        let checked = !model[this.checkName];
        //取消会选中当前框
        model[this.checkName] = checked;
        this.handleSubCheck(model, module, checked);
        this.handleParentCheck(model, module, checked);
    }

    /**
    * 处理子孙选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    private handleSubCheck(model: Model, module: Module, checked: boolean) {
        let rows = model[this.listField];
        if (!rows) {
            return;
        }
        //修改子节点选中数
        if (checked) {
            model[this.checkedChdNumName] = rows.length;
        } else {
            model[this.checkedChdNumName] = 0;
        }

        //子孙节点
        for (let d of rows) {
            let m: Model = module.model;
            m[this.checkName] = checked;
            this.handleSubCheck(m, module, checked);
        }
    }

    /**
    * 处理祖先节点选中状态
    * @param data       当前dom的数据
    * @param module     模块
    * @param checked    值
    */
    private handleParentCheck(model: Model, module: Module, checked: boolean) {
        //数据向上走两级，因为第一级为数组，第二级才到数据
        // let pmodel: Model = model.parent;
        // if (!pmodel || pmodel === module.model) {
        //     return;
        // }
        // pmodel = pmodel.parent;
        // if (!pmodel || pmodel === module.model) {
        //     return;
        // }

        // let data = pmodel.data;
        if (model[this.checkedChdNumName] === undefined) {
            model[this.checkedChdNumName] = 0;
        }
        if (checked) {
            model[this.checkedChdNumName]++;
        } else {
            model[this.checkedChdNumName]--;
        }

        let chk: boolean = model[this.checkName];

        if (model[this.checkedChdNumName] === 0) {
            model[this.checkName] = false;
        } else {
            model[this.checkName] = true;
        }
        //状态改变，向上递归
        if (chk !== model[this.checkName]) {
            this.handleParentCheck(model, module, checked);
        }
    }

    /**
     * 获取value
     */
    getValue(): any[] {
        const me = this;
        if (this.valueField === '') {
            return;
        }

        let va = [];
        let module: Module = ModuleFactory.get(this.moduleId);
        let model = module.model;
        getChecked(model[this.listField]);
        return va;

        function getChecked(rows) {
            if (Array.isArray(rows)) {
                for (let d of rows) {
                    if (d[me.checkName] === true) {
                        va.push(d[me.valueField]);
                    }
                    getChecked(d[me.listField]);
                }
            }
        }
    }
}

DefineElementManager.add('UI-TREE', {
    init: function (element: Element, parent?: Element) {
        new UITree(element, parent)
    }
});
