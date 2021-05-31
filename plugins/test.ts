import { DefineElementManager, Element } from "nodom";
import { UISelect } from "..";
import { pluginBase } from "./pluginBase";

/**
 * 手风琴插件
 */
export class UITest extends pluginBase {
    tagName: string = 'UI-TEST';

    constructor(element: Element, parent?: Element) {
        super(element);
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

        rootDom.add(new UISelect({
            dataName: 'hobby',
            listField: "hobbies",
            valueField: 'hid',
            displayField: "htitle",
            showEmpty: true
        }).element)

    }
}

DefineElementManager.add('UI-TEST', {
    init: function (element: Element, parent: Element) {
        new UITest(element, parent);
    }
});
