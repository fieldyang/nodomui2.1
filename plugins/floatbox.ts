import { DefineElementManager, Directive, Element, Expression, Model, Module, ModuleFactory, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 * 悬浮框
 */
export class UIFloatBox extends pluginBase {
    tagName: string = 'UI-FLOATBOX';

    //绑定数据项
    dataName: string;

    constructor(params: Element | Object, parent?: Element) {
        super(params);
        let element = new Element()
        if (params instanceof Element) {
            element = params;
        }
        element.setProp('name', '$ui_floatbox');
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
        this.dataName = '$ui_floatbox' + Util.genId();
        rootDom.addClass('nd-floatbox');
        new Directive('show', this.dataName + '.show', rootDom);
        rootDom.setProp('style', ['left:', new Expression(this.dataName + '.left'),
            'px;top:', new Expression(this.dataName + '.top'),
            'px;width:', new Expression(this.dataName + '.width'),
            "px;height:", new Expression(this.dataName + ".height"), "px;"], true);
        let innerCt: Element = new Element('div');
        rootDom.add(innerCt);
    }

    /**
     * 渲染前事件
     * @param module 
     * @param dom 
     */
    beforeRender(module: Module, dom: Element) {
        super.beforeRender(module, dom);
        if (this.needPreRender) {
            let model = module.model;
            model[this.dataName] = {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                show: false
            }
        }
    }

    /**
     * 打开floatbox
     * @param evt   事件对象
     */
    public show(evt, loc, el?) {
        let module: Module = ModuleFactory.getMain();
        if (!module) {
            return;
        }
        if (module) {
            let model: Model = module.model;

            if (model) {
                model[this.dataName].show = true;
                model[this.dataName].left = 0;
                model[this.dataName].top = 0;
                model[this.dataName].width = 0;
                model[this.dataName].height = 0;
                this.updateLoc(module, evt, el);
            }
        }
    }

    public hide() {
        let module: Module = ModuleFactory.getMain();
        let model = module.model;
        model[this.dataName].show = false;
    }
    /**
     * 计算位置
     * @param evt 
     */
    private updateLoc(module, evt, el?): any {
        // let el = module.getNode(this.element.key);

        // if (!el) {
        //     setTimeout(() => {
        //         this.updateLoc(module, evt)
        //     }, 0);
        //     return;
        // }


        // console.log(evt, el);

        let ex = evt.pageX;
        let ey = evt.pageY;

        let eox = evt.target.offsetLeft;
        let eoy = evt.target.offsetTop;

        // let ow = el.clientWidth;
        let oh = evt.target.clientHeight;
        let [x, y] = [0, 0];
        if (el) {
            [eox, eoy] = UITool.caclOffset(el);
            oh = el.clientHeight;
        }

        x = ex - eox - 3;
        y = ey - eoy + oh - 15;
        console.log('page', ex, ey);
        console.log('offset', eox, eoy);
        console.log(x, y);

        // let width = el.offsetWidth;
        // let height = el.offsetHeight;
        // if (x + width > window.innerWidth) {
        //     x = window.innerWidth - width;
        // }
        // if (y + height > window.innerHeight) {
        //     if (y - height - oh > 0) {
        //         y -= height + oh;
        //     }
        // }

        module.model[this.dataName].left = x;
        module.model[this.dataName].top = y;
        module.model[this.dataName].width = el ? el.clientWidth : evt.target.clientWidth;
        module.model[this.dataName].height = el ? el.clientHeight : evt.target.clientHeight;
    }
}


/**
 * 显示floatbox
 * @param dom   待加入的子节点
 * @param evt   事件对象
 * @param loc   位置 0:上下(下面放不下，则放上面)  1:左右(右侧放不下则放左边)
 */
export function floatbox(dom: Element, evt: Event, loc?: number) {
    let module: Module = ModuleFactory.getMain();

    if (!module) {
        return null;
    }

    // let floatBox: UIFloatBox | Element = <UIFloatBox>module.getNPlugin('$ui_floatbox');

    // if (floatBox) {

    //     //把传递的dom加入到源虚拟dom树
    //     let vDom = module.getElement(floatBox.element.key, true);

    //     vDom.children[0].children = [dom];

    //     floatBox.show(evt, loc);
    // }
    // else {
    //     floatBox = new UIFloatBox({}).element;
    //     return floatBox;
    // }
    // //新建manager
    // if (floatBox) {

    // }
}

//添加到元素库
DefineElementManager.add('UI-FLOATBOX', {
    init: function (element: Element, parent?: Element) {
        new UIFloatBox(element, parent);
    }
});
