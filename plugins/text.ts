import { DefineElementManager, Directive, Element } from 'nodom';
import { pluginBase } from './pluginBase';
import { UITool } from './uibase';

enum 

export class UITEXT extends pluginBase {
    tagName: string = 'UI-TEXT'

    /**
     * select绑定的数据字段名
     */
    dataName: string;

    /**
     * 图标
     */
    icon: string;
    /**
     * 图标位置 left,right
     */
    iconpos: string;

    constructor(element: Element, parent?: Element) {
        super(element);
        // this.extraParmas = {};
        UITool.handleUIParam(element, this,
            ['icon', 'iconpos'],
            ['icon', 'iconPos'],
            ['', 'left']
        );
        this.UITextGenerate(element);
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;
    }

    UITextGenerate(element: Element) {
        element.addClass('nd-text');
        //生成id
        let field = element.getDirective('field');
        let input: Element = new Element('input');
        input.setProp('type', 'text');

        element.add(input);

        //替换directive到input
        input.addDirective(new Directive('field', field.value, input));

        let vProp = element.getProp('value');
        if (!vProp) {
            vProp = element.getProp('value', true);
            input.setProp('value', vProp, true);
        } else {
            input.setProp('value', vProp);
        }

        //清除rootDom的指令和事件
        element.removeDirectives(['field']);
        element.events.clear();

        if (this.icon !== '') {
            let icon: Element = new Element('b');
            icon.addClass('nd-icon-' + this.icon);
            if (this.iconpos === 'left') {
                icon.addClass('nd-text-iconleft');
                element.children.unshift(icon);
            } else {
                element.add(icon);
            }
        }
    }
}

DefineElementManager.add('UI-TEXT', {
    init: function (element: Element, parent?: Element) {
        new UITEXT(element, parent);
    }
})
