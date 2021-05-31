import { DefineElementManager, Element, NEvent } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 * panel 插件
 */
export class UIPanel extends pluginBase {
    tagName: string = 'UI-PANEL';
    /**
     * panel 标题
     */
    title: string;
    /**
     * button 串
     */
    buttons: string[];

    /**
     * 头部图标按钮dom
     */
    headerBtnDom: Element;
    /**
     * 不显示头
     */
    noHeader: boolean;
    /**
     * 关闭按钮操作
     */
    closeHandler: Function | string;

    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['title', 'buttons|array'],
            ['title', 'buttons'],
            ['', []]
        );
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
        rootDom.addClass('nd-panel');
        //处理body
        this.handleBody(rootDom);
        //处理头部，如果title和button都不存在，则不处理
        if (this.title && this.title !== '' || this.buttons.length !== 0) {
            if (this.title === '') {
                this.title = 'panel';
            }
            //header
            let headerDom: Element = new Element('div');
            headerDom.addClass('nd-panel-header');
            if (this.title) {
                //title
                let titleCt: Element = new Element('span');
                titleCt.addClass('nd-panel-title');
                titleCt.assets.set('innerHTML', this.title);
                headerDom.add(titleCt);
            }

            let headbarDom: Element = new Element('div');
            headbarDom.addClass('nd-panel-header-bar');
            this.headerBtnDom = headbarDom;
            headerDom.add(headbarDom);
            rootDom.children.unshift(headerDom);

            //头部按钮
            for (let btn of this.buttons) {
                let a = btn.split('|');
                this.addHeadBtn(a[0], a[1]);
            }
        }
    }

    /**
     * 处理body
     * @param panelDom  panel dom
     * @param oe        原始dom
     */
    private handleBody(panelDom: Element) {
        //panel body
        let bodyDom: Element = new Element('div');
        bodyDom.addClass('nd-panel-body');

        //toolbar，放在panel body前
        let tbar: Element;
        //button group，，放在panel body后
        let btnGrp: Element;

        for (let i = 0; i < panelDom.children.length; i++) {
            let item = panelDom.children[i];

            if (item.defineEl) {
                if (item.defineEl.tagName === 'UI-TOOLBAR') {
                    tbar = item;
                } else if (item.defineEl.tagName === 'UI-BUTTONGROUP') {
                    btnGrp = item;
                } else {
                    bodyDom.add(item);
                }
            } else { //普通节点，放入panelbody
                bodyDom.add(item);
            }
        }

        panelDom.children = [];
        if (tbar) {
            panelDom.add(tbar);
        }
        panelDom.add(bodyDom);
        if (btnGrp) {
            panelDom.add(btnGrp);
        }
    }

    /**
     * 添加头部图标
     * @param icon      icon名 
     * @param handler   处理函数
     */
    addHeadBtn(icon: string, handler: string | Function) {
        let btn: Element = new Element('b');
        btn.addClass('nd-icon-' + icon);
        btn.addClass('nd-canclick');
        this.headerBtnDom.add(btn);
        if (handler) {
            btn.addEvent(new NEvent('click', handler));
        }
    }

}

DefineElementManager.add('UI-PANEL', {
    init: function (element: Element, parent?: Element) {
        new UIPanel(element, parent);
    }
});
