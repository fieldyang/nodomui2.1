import { Compiler, DefineElementManager, Directive, Element, Expression, Filter, Model, Module, ModuleFactory, NEvent, Util } from "nodom";
import { NUITipWords } from "./msg_zh";
import { pluginBase } from "./pluginBase";
import { UIEventRegister, UITool } from "./uibase";

/**
  let ui = new UISelect({
            dataName: 'hobby1',
            listField: "hobbies",
            valueField: "hid",
            displayField: "htitle",
            onChange: "change",
            showEmpty: true
        })
 */

/** 自定义元素
  let ui = new UISelect({
            dataName: 'hobby1',
            listField: "hobbies",
            valueField: "hid",
            displayField: "htitle",
            onChange: "change",
            showEmpty: true,
            customTemplate:
                `
            <div class="hobitem">
                    <span class="id">{{hid}}</span> <span class="title">{{htitle}} </span>
                    <span class="desc">{{desc}}</span>
                </div>
                `
        })
 */
interface IUISelect {
    /**
     * select绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 下拉框宽度
     */
    listWidth?: number;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 显示内容
     */
    displayField: string;

    /**
     * 允许过滤
     */
    allowFilter?: boolean;

    /**
     * 多选
     */
    multiSelect?: boolean;

    /**
     * 过滤器方法id
     */
    filterMethodId?: string;

    /**
     * change 事件或事件名
     */
    onChange?: string | Function;

    /**
     * 是否显示 请选择...
     */
    showEmpty?: boolean;
    /**
    * 自定义模板串 用于通过配置生成下拉框
    */
    customTemplate?: string;
    /**
    * 父插件的附加数据项
    */
    parentDataName?: string;
}

/**
 * select 插件
 * 
 */
export class UISelect extends pluginBase {
    tagName: string = 'UI-SELECT';
    /**
     * 附加数据项名
     */
    extraDataName: string;

    /**
     * 父插件的附加数据项
     */
    parentDataName: string;
    /**
     * select绑定的数据字段名
     */
    dataName: string;

    /**
     * 列表数据名
     */
    listField: string;

    /**
     * 下拉框宽度
     */
    listWidth: number;

    /**
     * 列表值数据name
     */
    valueField: string;

    /**
     * 显示内容
     */
    displayField: string;

    /**
     * 允许过滤
     */
    allowFilter: boolean;


    /**
     * 多选
     */
    multiSelect: boolean;

    /**
     * 下拉框key
     */
    listKey: string;
    /**
     * 过滤器方法id
     */
    filterMethodId: string;

    /**
     * 值 数组(multi)或单个值
     */
    value: any;

    /**
     * change 事件或事件名
     */
    onChange: string | Function;

    /**
     * 是否显示 请选择...
     */
    showEmpty: boolean;

    /**
    * 自定义模板串 用于通过配置生成下拉框
    */
    customTemplate: string;

    constructor(params: Element | IUISelect, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['valuefield', 'displayfield', 'multiselect|bool', 'listfield', 'listwidth|number', 'allowfilter|bool', 'onchange', 'showempty|bool'],
                ['valueField', 'displayField', 'multiSelect', 'listField', 'listWidth', 'allowFilter', 'onChange', 'showEmpty'],
                [null, null, null, null, 0, null, '', null])

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
    * 生成插件的内容
    * @param rootDom 插件产生的虚拟dom
    * @param genMode 生成虚拟dom的方式，true:ast编译的模板的方式，false:传入配置对象的方式
    */
    private generate(rootDom: Element) {
        let me = this;
        //生成id
        this.extraDataName = '$ui_select_' + Util.genId();
        rootDom.addClass('nd-select');

        let field = rootDom.getDirective('field');
        if (field) {
            this.dataName = field.value;
            rootDom.removeDirectives(['field']);
            //移除事件
            rootDom.events.delete('change');
        }

        //修改model
        // new Directive('model', this.extraDataName, rootDom);

        //下拉框
        let listDom: Element = new Element('div');

        listDom.addClass('nd-select-list');
        if (this.listWidth) {
            listDom.assets.set('style', 'width:' + this.listWidth + 'px');
        }
        new Directive('show', this.extraDataName + '.show', listDom);
        let itemDom: Element;

        if (this.customTemplate && this.customTemplate != '') {
            // new的方式提供模板串来自定义
            // 编译成虚拟dom
            itemDom = Compiler.compile(this.customTemplate);
        } else {
            // 如果有，则表示在写模板的时候传入了自定义模板串
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
        //item文本显示内容
        let item: Element = new Element('div');
        item.children = itemDom.children;
        item.addClass('nd-select-itemcontent');
        itemDom.addClass('nd-select-item');
        let directive = new Directive('repeat', this.extraDataName + '.datas', itemDom);
        new Directive('class', "{'nd-select-selected':'___selected'}", itemDom);
        let icon: Element = new Element('b');
        icon.addClass('nd-select-itemicon');
        itemDom.children = [item, icon];
        //点击事件
        itemDom.addEvent(new NEvent('click',
            (dom, module) => {
                // let name = this.name || this.dataName;
                // let plugin = this
                // let plugin = this.moduleId ? this : module.getNPlugin(name);
                if (!this.multiSelect) {
                    // if (plugin) {
                    //     this.hideList.apply(plugin);
                    // } else {
                    //     // module.model
                    this.hideList();
                    // }
                }
                // if (plugin) {
                //     this.select.apply(plugin, [dom.model]);
                // } else {
                this.select(dom.model);
                // }
            }
        ));

        //显示框
        let showDom: Element = new Element('div');
        showDom.addClass('nd-select-inputct');
        let input: Element = new Element('input');
        input.addClass('nd-select-show');

        //多选择，不允许输入
        if (this.multiSelect) {
            input.setProp('readonly', true);
        }
        input.setProp('value', new Expression(this.extraDataName + '.display'), true);
        showDom.add(input);
        icon = new Element('b');
        //点击展开或收拢 showDom

        showDom.addEvent(new NEvent('click',
            (dom, module, e, el) => {
                console.log(dom, module, e, el);

                let model = this.model[this.extraDataName]
                if (model["show"]) {
                    // module.model
                    me.hideList();
                    // dom.model.show = false;
                    // this.float.hide();
                } else {
                    model["show"] = true;
                    // this.float.show(e, 0);
                    let height = el.offsetHeight;
                    let y = e.clientY + el.offsetHeight - e.offsetY;
                    UITool.adjustPosAndSize(module, this.listKey, e.clientX, y, height, null, true);
                }
            }
        ));

        if (this.allowFilter) {
            //给repeat增加filter
            this.filterMethodId = '$$nodom_method_' + Util.genId();
            let filter: Filter = new Filter(['select', 'func', this.filterMethodId]);
            directive.filters = [filter];

            input.assets.set('readonly', 'true');
            //input上覆盖一个query input
            let queryDom: Element = new Element('input');
            queryDom.addClass('nd-select-search');
            queryDom.addDirective(new Directive('field', this.extraDataName + '.query', queryDom));
            queryDom.addDirective(new Directive('class', "{'nd-select-search-active':'show'}", queryDom));
            showDom.add(queryDom);
        }
        showDom.add(icon);
        listDom.children = [itemDom];
        rootDom.children = [showDom, listDom];
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        let me = this;
        super.beforeRender(module, dom);
        this.listKey = dom.children[1].key;
        let model: Model = this.model;
        if (this.needPreRender) {
            model[this.extraDataName] = {
                show: false,     //下拉框显示
                display: '',     //显示内容
                query: '',       //查询串
                datas: []        //下拉框数据
            }
            //增加过滤器方法
            module.addMethod(this.filterMethodId, () => {
                let model: Model = this.model;
                let rows = model[this.extraDataName].datas;
                if (rows) {
                    return rows.filter((item) => {
                        return model[this.extraDataName].query === '' || item[me.displayField].indexOf(model[this.extraDataName].query) !== -1;
                    });
                }
                return [];
            });
            //注册click事件到全局事件管理器
            UIEventRegister.addEvent('click', module.id, dom.key,
                (module: Module, dom: Element, inOrout: boolean, e: Event) => {

                    let model: Model = this.model;
                    //外部点击则关闭
                    if (!inOrout && model[this.extraDataName].show) {
                        model[this.extraDataName].show = true;
                        // this.float.hide() model
                        me.hideList();
                    }
                }
            );
        }

        let data = model[this.extraDataName];
        //下拉值初始化
        if (this.listField && data.datas.length === 0 && model[this.listField]) {
            let rows = Util.clone(model[this.listField]);
            //增加empty 选项
            if (this.showEmpty) {
                let d = {};
                d[this.displayField] = NUITipWords.emptySelect;
                d['___selected'] = false;
                rows.unshift(d);
            }
            model[this.extraDataName].datas = rows;
        }
        this.setValue(model[this.dataName]);
    }

    /**
     * 设置数据
     * @param module    模块
     * @param value     值
     */
    setValue(value: any) {
        if (!this.dataName) {
            return;
        }
        if (this.multiSelect && !Array.isArray(value)) {
            value = [value];
        }
        let module: Module = ModuleFactory.get(this.moduleId);
        let model: Model = this.model;

        let value1 = model[this.dataName];
        if (value !== value1) {
            //设置新值
            model[this.dataName] = value;
            if (this.onChange !== '') { //change 事件
                let foo;
                let tp = typeof this.onChange;
                if (tp === 'string') {
                    foo = module.getMethod(<string>this.onChange);
                } else if (tp === 'function') {
                    foo = this.onChange;
                }
                if (foo) {
                    foo.apply(null, [model, module, value, this.value]);
                }
            }
        }
        this.value = value;
        this.genSelectedAndDisplay(model);
    }

    /**
     * 设置选中或非选中
     * @param model 
     */
    private select(model: Model) {
        let v = model[this.valueField];
        if (this.multiSelect) {
            if (!this.value) {
                this.value = [];
            }
            if (model["___selected"]) {
                let ind = this.value.indexOf(v);
                if (ind !== -1) {
                    this.value.splice(ind, 1);
                }
            } else {
                this.value.push(v);
            }
            // model["___selected"] = !model["___selected"]
        } else {
            if (!model["___selected"]) {
                this.value = v;
            }
        }
        this.setValue(this.value);
    }
    /**
     * 设置选中和显示内容
     * @param module    模块
     */
    genSelectedAndDisplay(model: Model) {
        if (!this.dataName) {
            return;
        }
        // let module: Module = ModuleFactory.get(this.moduleId);
        //附加数据model
        // let model: Model = module.model;
        let text;

        if (this.multiSelect) {
            let ta = [];
            if (!this.value) {
                return;
            }
            for (let d of model[this.extraDataName].datas) {
                d.___selected = this.value.includes(d[this.valueField]);
                if (d.___selected) {
                    ta.push(d[this.displayField]);
                }
            }
            text = ta.join(',');
        } else {
            for (let d of model[this.extraDataName].datas) {
                if (this.value == d[this.valueField]) {
                    text = d[this.displayField];
                    d.___selected = true;
                } else {
                    d.___selected = false;
                }
            }
        }
        model[this.extraDataName].display = text;
    }

    /**
     * 隐藏下拉list
     * @param module module
     * @param model  附加model   
     */
    hideList(model?: Model) {
        if (!model) {
            let module: Module = ModuleFactory.get(this.moduleId);
            model = this.model
        }
        model[this.extraDataName].show = false;
        model[this.extraDataName].query = '';
    }
}
DefineElementManager.add('UI-SELECT', {
    init: function (element: Element, parent?: Element) {
        new UISelect(element, parent)
    }
});
