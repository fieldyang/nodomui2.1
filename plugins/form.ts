import { DefineElementManager, Element } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 * form 插件
 */
class UIForm extends pluginBase {
    tagName: string = 'UI-FORM';
    /**
     * 附加数据项名
     */
    extraDataName: string;

    /**
     * label宽度，默认100
     */
    labelWidth: number;

    constructor(element: Element, parent?: Element) {
        super(element);
        UITool.handleUIParam(element, this,
            ['labelwidth|number'],
            ['labelWidth'],
            [100]);
        this.generate(element);
        element.tagName = 'form';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 产生插件内容
     * @param rootDom 插件对应的element
     */
    private generate(rootDom: Element) {
        rootDom.addClass('nd-form');
        console.log(rootDom);

        for (let c of rootDom.children) {
            if (c.tagName.toUpperCase() !== 'ROW') {
                continue;
            }
            //row div
            c.tagName = 'DIV';
            c.addClass('nd-form-row');
            if (c.children) {
                for (let c1 of c.children) {
                    if (c1.tagName.toUpperCase() !== 'ITEM') {
                        continue;
                    }
                    //item div
                    c1.tagName = 'DIV';
                    c1.addClass('nd-form-item');
                    if (c1.children) {
                        for (let c2 of c1.children) {
                            //修改label width
                            if (c2.tagName.toUpperCase() === 'LABEL') {
                                c2.assets.set('style', 'width:' + this.labelWidth + 'px');
                            }
                            if (c2.tagName.toUpperCase() === 'UNIT') {
                                c2.tagName = 'span';
                                c2.addClass('nd-form-item-unit');
                            }
                        }
                    }
                }
            }
        }
    }
}

DefineElementManager.add('UI-FORM', {
    init: function (element: Element, parent?: Element) {
        new UIForm(element, parent);
    }
});
