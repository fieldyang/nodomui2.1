import { DefineElementManager, Element } from "nodom";
import { pluginBase } from "./pluginBase";

/**
 * toolbar 插件
 */
export class UIToolbar extends pluginBase {
    tagName: string = 'UI-TOOLBAR';
    constructor(element: Element, parent?: Element) {
        super(element);
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
