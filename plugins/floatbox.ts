import { Compiler, DefineElementManager, Directive, Element, Expression, Model, Module, ModuleFactory, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

export enum POSITIONTYPE {
    /**
     * 附着在一个dom上，类似于气泡提示框
     */
    ATTACH = 'attach',
    /**
     *  脱离具体的DOM,类似于panel，dialog
     */
    FLOAT = 'float'
}

export enum POSITION {
    /**
     * type为float:定位于页面顶部中间，
     * type为ATTACH:附着在dom的上面
     */
    TOP = 'top',
    /**
    * type为float:定位于页面底部中间，
    * type为ATTACH:附着在dom的下面
    */
    BOTTOM = 'bottom',
    /**
    * type为float:定位于页面左边中间，
    * type为ATTACH:附着在dom的左边
    */
    LEFT = 'left',
    /**
    * type为float:定位于页面右边中间，
    * type为ATTACH:附着在dom的右边
    */
    RIGHT = 'right',
    /**
    * type为float有效，存在于网页中间
    */
    MIDDLE = 'middle',
    /**
    * type为float有效，存在于网页左上
    */
    TOPLEFT = 'topleft',
    /**
    * type为float有效，存在于网页右上
    */
    TOPRIGHT = 'topright',
    /**
    * type为float有效，存在于网页左下
    */
    BOTTOMLEFT = 'bottomleft',
    /**
    * type为float有效，存在于网页右下
    */
    BOTTOMRIGHT = 'bottomright',

}

export interface IFloatBoxPosition {
    type: POSITIONTYPE;
    pos: POSITION;
}

interface IUIFloatBox {
    // 悬浮框的类型，默认为气泡类型
    type?: POSITIONTYPE;

    // 默认气泡浮于dom下方
    pos?: POSITION

    width: number;

    height: number;
}

/**
 * 悬浮框
 */
export class UIFloatBox extends pluginBase {
    tagName: string = 'UI-FLOATBOX';

    //绑定数据项
    dataName: string;

    // 悬浮框的类型，默认为气泡类型
    type: POSITIONTYPE = POSITIONTYPE.ATTACH;

    // 默认气泡浮于dom下方
    pos: POSITION = POSITION.BOTTOM;

    width: number;

    height: number;

    constructor(params: Element | IUIFloatBox, parent?: Element) {
        super(params);
        let element = new Element()
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['type', 'pos', 'width', 'height'],
                ['type', 'pos', 'width', 'height'],
                [POSITIONTYPE.ATTACH, POSITION.BOTTOM, "150", "50"]);
        } else {
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
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
        rootDom.setProp('style', ['left:', new Expression(this.dataName + '.left'),
            'px;top:', new Expression(this.dataName + '.top'), "px;", "width:",
            this.width, "px;", "height:", this.height, "px;"], true);
        new Directive('show', this.dataName + '.show', rootDom);
        let innerCt: Element = new Element('div');
        new Directive('class', `{"nd-attachbox-bottom":"${this.dataName}.pos == 'bottom'",
                                "nd-attachbox-right":"${this.dataName}.pos == 'right'",
                                "nd-attachbox-left":"${this.dataName}.pos == 'left'",
                                "nd-attachbox-top":"${this.dataName}.pos == 'top'"
                                }`, innerCt);
        innerCt.setProp('style', 'width:100%;heigt:100%;')
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
            let model = dom.model;
            model[this.dataName] = {
                left: 0,
                top: 0,
                pos: 'bottom',
                // width: 0,
                // height: 0,
                show: false
            }
        }
    }

    /**
     * 打开floatbox
     * @param evt   事件对象
     */
    public show(evt: Event, loc?: IFloatBoxPosition) {
        let model: Model = this.model;
        model[this.dataName].show = true;

        this.updateLoc(evt, loc);
    }


    /**
     * 计算位置
     * @param evt 
     */
    private updateLoc(evt, loc?): any {
        let model: Model = this.model;
        if (loc) {
            //更新类型
            if (this.type != loc.type) {
                this.type = loc.type
            }
            if (loc.pos && this.pos != loc.pos) {
                // 更新位置
                model[this.dataName].pos = loc.pos;
                this.pos = loc.pos;
            }
        }
        let [ow, oh] = [window.innerWidth, window.innerHeight]; //定位元素的宽高
        let [eox, eoy] = [0, 0];//定位元素的位置
        let [x, y] = [0, 0]; // floatbox的位置
        if (this.type === POSITIONTYPE.ATTACH) {
            //是气泡框
            //按照事件对象来定位
            [ow, oh] = [evt.target.offsetWidth, evt.target.offsetHeight];
            [eox, eoy] = UITool.caclOffset(evt.target)

            switch (this.pos) {
                case POSITION.BOTTOM: // 气泡框在下边
                    // 计算坐标
                    x = eox;
                    y = eoy + oh + 15;
                    break;
                case POSITION.RIGHT: // 气泡框在右边
                    // 计算坐标
                    x = eox + ow + 15;
                    y = eoy;
                    break;
                case POSITION.TOP: // 气泡框在上边
                    // 计算坐标
                    x = eox;
                    y = eoy - this.height - 35;
                    break;
                case POSITION.LEFT: // 气泡框在左边
                    // 计算坐标
                    x = eox - this.width - 35;
                    y = eoy;
                    break;
                default: break;
            }
        }

        this.model[this.dataName].left = x;
        this.model[this.dataName].top = y;
    }
}

/**
 * 隐藏floatbox
 */
export function hideFloatBox() {
    let module: Module = ModuleFactory.getMain();
    let model = module.model;
    let floatBox: UIFloatBox | Element = <UIFloatBox>module.getElement({ name: '$ui_floatbox', type: 'defineelement' }, true);
    model[floatBox.dataName].show = false;
}
/**
 * 显示floatbox
 * @param dom   待加入的子节点
 * @param evt   事件对象
 * @param loc   位置 0:上下(下面放不下，则放上面)  1:左右(右侧放不下则放左边)
 */
export function showFloatBox(dom: Element | string, evt: Event, loc?: IFloatBoxPosition) {
    let module: Module = ModuleFactory.getMain();

    if (!module) {
        return null;
    }

    //     vDom.children[0].children = [dom];

        // floatBox.show(evt, loc);
    }



//添加到元素库
DefineElementManager.add('UI-FLOATBOX', {
    init: function (element: Element, parent?: Element) {
        new UIFloatBox(element, parent);
    }
});
