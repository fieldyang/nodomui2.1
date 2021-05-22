import { DefineElement, DefineElementManager, Directive, Element, IExtraParmas, UITool } from 'nodom';
class UITEXT extends DefineElement {
    tagName: string = 'UI-TEXT'
    constructor(element: Element, parent?: Element) {
        super(element);
        // this.extraParmas = {};
        UITool.handleUIParam(element, this,
            ['icon', 'iconpos'],
            ['icon', 'iconPos'],
            ['', 'left']
        );
        this.UITextGenerate(this.extraParmas, element);
        element.tagName = 'div';
        element.defineEl = this;
    }

    UITextGenerate(uitextParams: IExtraParmas, element: Element) {
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

        if (uitextParams.icon !== '') {
            let icon: Element = new Element('b');
            icon.addClass('nd-icon-' + uitextParams.icon);
            if (uitextParams.iconpos === 'left') {
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
