import { DefineElementManager, Element } from "nodom";
import { pluginBase } from "./pluginBase";

/**
  let ui = new UIToolbar().element;
        let btn1 = new UIButton({
            nobg: true,
            icon: 'menu',
            clickEvent: 'change'
        })
        ui.add(btn1.element);
        let btn2 = new UIButton({
            nobg: true,
            icon: 'arrow-down',
            text: '颜色',
            iconPos: ICONPOS.RIGHT,
            clickEvent: 'change'
        })
        ui.add(btn2.element);
        let btn3 = new UIButton({
            nobg: true,
            icon: 'search',
            clickEvent: 'change'
        })
        ui.add(btn3.element);
        let btn4 = new UIButton({
            nobg: true,
            icon: 'ashbin',
            clickEvent: 'change'
        })
        ui.add(btn4.element);
 */


/**
 * toolbar 插件
 */
export class UIToolbar extends pluginBase {
    tagName: string = 'UI-TOOLBAR';
    constructor(params?: Element | Object, parent?: Element) {
        super(params);
        let element = new Element()
        if (params instanceof Element) {
            element = params;
        }
        element.tagName = 'div';
        element.addClass('nd-toolbar');
        element.defineEl = this;
        this.element = element;
    }
}

DefineElementManager.add('UI-TOOLBAR', {
    init: function (element: Element, parent?: Element) {
        new UIToolbar(element, parent)
    }
});
