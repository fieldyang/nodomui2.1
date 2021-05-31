import { Element } from "nodom";
import { pluginBase } from "./pluginBase";

/**
 * panel 插件
 */
class UITab extends pluginBase {
    tagName: string = 'UI-TAB';

    /**
     * 附加数据项名
     */
    extraDataName: string;

    /**
     * tab位置 top left right bottom
     */
    position: string;

    /**
     * 允许关闭
     */
    allowClose: boolean;

    /**
     * 对象的modelId
     */
    modelId: number;

    /**
     * 模块id
     */
    moduleId: number;

    /**
     * 附加数据项modelId
     */
    extraModelId: number;

    /**
     * 绑定数据的数据项名
     */
    listField: string;
    /**
     * tab对象 [{title:tab1,name:tab1,active:true},...] 用于激活显示tab
     */
    tabs = [];

    /**
     * bodydom的key
     */
    bodyKey: string;

    /**
     * body 高度
     */
    bodyHeight: number;

    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['position', 'allowclose|bool', 'listField', 'height|number'],
            ['position', 'allowClose', 'listField', 'bodyHeight'],
            ['top', null, '', 0]);
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
        this.extraDataName = '$ui_tab_' + Util.genId();
        this.name = rootDom.getProp('name');

        rootDom.addClass('nd-tab');
        if (this.position === 'left' || this.position === 'right') {
            rootDom.addClass('nd-tab-horizontal');
        }

        let headDom: Element = new Element('div');
        headDom.addClass('nd-tab-head');

        let bodyDom: Element = new Element('div');
        this.bodyKey = bodyDom.key;
        bodyDom.addClass('nd-tab-body');

        if (this.bodyHeight > 0) {
            bodyDom.assets.set('style', 'height:' + this.bodyHeight + 'px');
        }
        // 如果有，则表示自定义
        let index = 1;
        let activeIndex: number = 0;
        let itemDom: Element;

        for (let c of rootDom.children) {
            if (!c.tagName) {
                continue;
            }
            //tab name
            let tabName: string = 'Tab' + index++;
            //获取或设置默认title
            let title: string = c.getProp('title') || tabName;
            //存储状态
            let active: boolean = c.getProp('active') || false;
            if (active) {
                activeIndex = index;
            }

            this.tabs.push({ title: title, name: tabName, active: active });

            //tab 内容
            let contentDom: Element = new Element('div');
            contentDom.children = c.children;
            //show 指令
            contentDom.addDirective(new Directive('show', this.extraDataName + '.' + tabName, contentDom));
            bodyDom.add(contentDom);

            if (itemDom) {
                continue;
            }

            c.tagName = 'div';
            c.delProp(['title', 'active', 'name']);
            c.addClass('nd-tab-item');

            let txt: Element = new Element();
            txt.expressions = [new Expression('title')];
            c.children = [txt];
            //close
            if (this.allowClose) {
                let b: Element = new Element('b');
                b.addClass('nd-tab-close');
                //click禁止冒泡
                b.addEvent(new NEvent('click', ':nopopo', (dom, module) => {
                    me.delTab(dom.model.name, module);
                }));
                c.add(b);
            }
            c.addDirective(new Directive('repeat', this.extraDataName + '.datas', c));
            c.addDirective(new Directive('class', "{'nd-tab-item-active':'active'}", c));

            c.addEvent(new NEvent('click', (dom, module) => {
                me.setActive(dom.model.name, module);
            }));
            itemDom = c;
        }
        headDom.add(itemDom);
        // 设置默认active tab
        if (activeIndex === 0 && this.tabs.length > 0) {
            this.tabs[0].active = true;
        }
        if (this.position === 'top' || this.position === 'left') {
            rootDom.children = [headDom, bodyDom];
        } else {
            rootDom.children = [bodyDom, headDom];
        }
    }
    /**
     * 后置渲染
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        //uidom model
        let model: Model;
        //附加数据model
        if (this.needPreRender) {
            model = module.model;
            let data = {
                datas: this.tabs
            }
            //用于body显示
            for (let d of this.tabs) {
                data[d.name] = d.active;
            }
            this.bodyKey = dom.children[1].key;
            model[this.extraDataName] = data;
        }
    }

    /**
     * 添加tab
     * @param cfg {}
     *          title:      tab 标题
     *          name:       tab 名(模块内唯一)
     *          content:    显示内容(和module二选一)
     *          module:     模块类名
     *          moduleName: 模块名
     *          data:       模块数据或url(module定义后可用) 
     *          active:     是否激活
     *          index:      tab在全局索引的位置，默认添加到最后
     */
    addTab(cfg: any) {
        let module: Module = ModuleFactory.get(this.moduleId);
        if (!module) {
            return;
        }

        let model: Model = module.model;

        //设置索引
        let index: number = Util.isNumber(cfg.index) ? cfg.index : model.datas.length;
        //tab名
        let tabName: string = cfg.name || ('Tab' + Util.genId())
        model.datas.splice(index, 0, {
            title: cfg.title,
            name: tabName,
            active: false
        });
        model.set(tabName, false);
        //需要添加到virtualDom中，否则再次clone会丢失
        let bodyDom: Element = module.virtualDom.query(this.bodyKey);
        let dom: Element;
        //内容串    
        if (cfg.content) {
            dom = Compiler.compile(cfg.content);
        } else if (cfg.module) { //引用模块
            dom = new Element('div');
            let mdlStr: string = cfg.module;
            if (cfg.moduleName) {
                mdlStr += '|' + cfg.moduleName;
            }
            dom.addDirective(new Directive('module', mdlStr, dom));
            if (cfg.data) {
                dom.setProp('data', cfg.data);
            }
        }
        dom.addDirective(new Directive('show', this.extraDataName + '.' + tabName, dom));
        bodyDom.children.splice(index, 0, dom);
        //设置激活
        if (cfg.active) {
            this.setActive(tabName, module);
        }
    }

    /**
     * 删除tab
     * @param tabName   tab名
     * @param module    模块
     */
    delTab(tabName: string, module?: Module) {
        if (!module) {
            module = ModuleFactory.get(this.moduleId);
        }
        let model: Model = module.model;
        let datas = model.datas;
        let activeIndex: number;
        //最后一个不删除
        if (datas.length === 1) {
            return;
        }
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].name === tabName) {
                //如果当前删除为active，设定active index
                //如果不为最后，则取下一个，否则取0 
                if (datas[i].active) {
                    if (i < datas.length - 1) {
                        activeIndex = i;
                    } else {
                        activeIndex = 0;
                    }
                }
                //删除tab中的对象
                datas.splice(i, 1);
                //删除show绑定数据

                model.del(tabName);
                //删除body 中的对象，需要从原始虚拟dom中删除
                let bodyDom: Element = module.virtualDom.query(this.bodyKey);
                bodyDom.children.splice(i, 1);
                break;
            }
        }
        //设置active tab
        if (activeIndex !== undefined) {
            this.setActive(datas[activeIndex].name, module);
        }
    }

    /**
     * 设置激活
     * @param tabName   tab名
     * @param module    模块
     */
    setActive(tabName: string, module?: nodom.Module) {
        if (!module) {
            module = nodom.ModuleFactory.get(this.moduleId);
        }
        let pmodel: nodom.Model = module.getModel(this.extraModelId);
        let datas = pmodel.data.datas;

        let activeData;
        //之前的激活置为不激活
        for (let o of datas) {
            if (o.active) {
                pmodel.data[o.name] = false;
                o.active = false;
            }
            if (o.name === tabName) {
                activeData = o;
            }
        }
        //tab active
        activeData.active = true;
        //body active
        pmodel.data[tabName] = true;
    }
}

nodom.PluginManager.add('UI-TAB', UITab);
