import { DefineElementManager, Element, Module, Util } from "nodom";
import { UIPagination } from "..";
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
        let ui = new UIPagination({
            totalName: 'total',
            pageSize: 10,
            showTotal: true,
            showGo: true,
            currentPage: 1,
            showNum: 10,
            pageSizeData: [10, 20, 30, 50],
            steps: 10,
            dataUrl: 'data/grid1.json',
            pageName: 'page',
            sizeName: 'rows',
            onChange: 'changePage',
            onBeforeReq: 'beforeReq',
            onReq: 'reqData'
        })

        rootDom.add(ui.element)
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
