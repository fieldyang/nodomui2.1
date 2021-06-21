import { NEvent, DefineElement, Element, Module, Directive, Model, Expression, DefineElementManager } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";
class Rate extends pluginBase {
    /**
     * 长度
     */
    length: number;
    /**
     * 绑定的字段
     **/
    dataField: string;
    /**
     * 是否只读
     */
    readonly: boolean = false;

    level: number;
    constructor(params: Element, parent?: Element) {
        super(params);
        let rootDom: Element = new Element();
        if (params instanceof Element) {
            rootDom = params;
            UITool.handleUIParam(rootDom, this,
                ['length', 'datafield',],
                ['length', 'dataField'],
                [5, '']
            );
            if (rootDom.hasProp('readonly')) {
                this.readonly = true;
            }
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.init(rootDom);
        rootDom.tagName = 'div';
        rootDom.defineEl = this;
        this.element = rootDom;
    }
    init(element: Element) {
        let that = this;
        let ul: Element = new Element('ul');
        ul.addClass('nd-rate');
        let chd: Array<Element> = new Array();
        for (let i = 0; i < this.length; i++) {
            let star = new Element('li');
            star.addClass('nd-inline');
            let item = new Element('i');
            item.addClass('nd-rate-item');
            if (!this.readonly) {
                star.addEvent(new NEvent('click', function (dom, module, e, el) {   
                    this[that.dataField] = i + 1;
                }));
            };
            star.add(item);
            chd.push(star);
        };
        ul.children = chd;
        element.add(ul);
        let text = new Element('span');
        let comment = new Element();
        comment.expressions = [new Expression('Math.floor(' + this.dataField + ')' + '||0'), '星'];
        text.addClass('nd-inline');
        text.add(comment);
        element.add(text);
    };
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
    };
    afterRender(module: Module, dom: Element) {
        super.afterRender(module, dom);
        let model = dom.model;
        let level = model.$query(this.dataField) || 0;
        let stars = dom.query({
            tagName: 'ul',
        });
        if (typeof level === 'string') {
            level = parseInt(level);
        } else if (typeof level === 'number') {
            this.level = level > 0 ? Math.round(level) : 0;
        }
        stars.children.forEach((star, index) => {
            if (index < level) {
                star.children[0].addClass('nd-icon-collect-fill');
            } else {
                star.children[0].addClass('nd-icon-collect');
            }
        });
    }
}
DefineElementManager.add('UI-RATE', {
    init: function (element: Element, parent?: Element) {
        new Rate(element);
    }
});
