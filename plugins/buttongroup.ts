import { DefineElementManager, Element } from "nodom";
import { pluginBase } from "./pluginBase";

/**
 * buttongroup 插件
 */
export class UIButtonGroup extends pluginBase {
    tagName: string = 'UI-BUTTONGROUP';

    constructor(params?: Element, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;
        }
        element.addClass('nd-buttongroup');
        element.tagName = 'div';
        element.defineEl = this;
        this.element = element;
    }
}

DefineElementManager.add('UI-BUTTONGROUP', {
    init: function (element: Element, parent?: Element) {
        new UIButtonGroup(element, parent);
    }
});
