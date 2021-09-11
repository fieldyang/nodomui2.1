import { DefineElementManager, Directive, Element, Model, Module, ModuleFactory, Util } from "nodom";
import { UIPanel } from "./panel";

/**
 * dialog 插件
 */
export class UIDialog extends UIPanel {
    tagName: string = 'UI-DIALOG';

    /**
     * 数据项名
     */
    dataName: string;

    /**
     * 自动打开
     */
    autoOpen: boolean;

    /**
     * close 事件名
     */
    onClose: string;

    /**
     * open 事件名
     */
    onOpen: string;


    constructor(element: Element, parent?: Element) {
        super(element);
        this.dialogGenerate(element);
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;

    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private dialogGenerate(rootDom: Element) {
        // console.log(rootDom);
        // console.log(parent);

        const me = this;
        this.dataName = '$ui_dialog_' + Util.genId();
        // rootDom.removeClass('nd-panel')
        rootDom.addClass('nd-dialog');
        // let panelDom = panel.element;

        //获取插件名
        rootDom.setProp('name', rootDom.getProp('name'));
        //autoopen
        this.autoOpen = rootDom.hasProp('autoopen');
        //事件名
        this.onClose = rootDom.getProp('onclose');
        this.onOpen = rootDom.getProp('onopen');

        // panelDom.delProp(['name', 'autoopen']);
        //增加关闭按钮

        // 如果没有header
        if (!rootDom.children[0].hasClass('nd-panel-header')) {
            let headerDom: Element = new Element('div');
            headerDom.addClass('nd-panel-header');
            this.headerBtnDom = headerDom;
        }
        // 添加   ×  按钮
        this.addHeadBtn('cross', () => {
            me.close();
        })

        new Directive('show', this.dataName, rootDom);
        rootDom.addClass('nd-dialog-body');
        //蒙版
        let coverDom: Element = new Element('div');
        coverDom.addClass('nd-dialog-cover');
        rootDom.add(coverDom);
        rootDom.delProp(['autoopen'])
    }

    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(dom: Element,module: Module) {
        super.beforeRender( dom,module);
        if (this.needPreRender) {
            if (this.autoOpen) {
                this.open();
            }
        }
    }

    /**
     * 打开dialog
     * @param module 
     */
    public open() {
        let module: Module = ModuleFactory.get(this.moduleId);
        if (module) {
            let model: Model = module.model;
            if (model) {
                model[this.dataName] = true;
            }

            //onopen事件
            if (this.onOpen) {
                let foo = module.getMethod(this.onOpen);
                if (foo) {
                    Util.apply(foo, model, [module]);
                }
            }
        }
    }

    /**
     * 关闭dialog
     * @param module 
     */
    public close() {
        let module: Module = ModuleFactory.get(this.moduleId);

        if (module) {
            let model: Model = module.model;
            if (model) {
                model[this.dataName] = false;
            }

            //onClose事件
            if (this.onClose) {
                let foo = module.getMethod(this.onClose);
                if (foo) {
                    Util.apply(foo, model, [module]);
                }
            }
        }
    }
}

//添加到元素库
DefineElementManager.add('UI-DIALOG', {
    init: function (element: Element, parent?: Element) {
        new UIDialog(element, parent);
    }
});
