import { DefineElementManager, Element, Module, Util } from "nodom";
import { UIListTransfer } from "./listtransfer";
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
        this.extraDataName = '$ui_test_' + Util.genId();
        console.log(11);
        let ui = new UIListTransfer({
            dataName: 'selectedUser1',
            listField: 'users',
            valueField: 'uid',
            displayField: "userName"
        })
        let ui2 = new UIListTransfer({
            dataName: 'selectedUser2',
            listField: 'users',
            valueField: 'uid',
            displayField: "userName",
            customTemplate: `
                <div>
                    <span style="width: 100px; display: inline-block">{{userName}}</span>
                    <span>{{company}}</span>
                </div>
            `
        })
        rootDom.add(ui.element)
        rootDom.add(ui2.element)
    }
    /**
   * 前置渲染
   * @param module 
   * @param dom 
   */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            //根据this.extraData 来创建extraData
            this.model[this.extraDataName] = {
            }
        }
    }
}

DefineElementManager.add('UI-TEST', {
    init: function (element: Element, parent: Element) {
        new UITest(element, parent);
    }
});
