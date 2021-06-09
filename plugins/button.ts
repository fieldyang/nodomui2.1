import { DefineElementManager, Element, NEvent } from "nodom";
import { pluginBase } from "./pluginBase";
import { ICONPOS, SIZE, THEME, UITool } from "./uibase";
/** 如果需要new的方式新建 可以参考下面
        let ui = new UIButton({
            size: SIZE.NORMAL,
            icon: "search",
            iconPos: ICONPOS.LEFT,
            text: '按钮',
            theme: THEME.ACTIVE,
            clickEvent: 'itemClick'
        })
 */
interface IUIButtonCfg extends Object {
    /**
    * 按钮大小 small normal large
    */
    size?: SIZE;

    /**
     * 按钮图标
     */
    icon?: string;

    /**
     * 图片位置  left top right bottom
     */
    iconPos?: ICONPOS;

    /**
     * 背景透明
     */
    nobg?: boolean;

    /**
     * 按钮文本 内容 
     */
    text?: string;
    /**
     * 主题 active error warn success
     */
    theme?: THEME;
    /**
     * 按钮绑定的事件
     */
    clickEvent?: string;

}

/**
 * 按钮插件
 */
export class UIButton extends pluginBase {
    tagName: string = 'UI-BUTTON';

    /**
     * 按钮大小 small normal large
     */
    size: string = SIZE.NORMAL;

    /**
     * 按钮图标
     */
    icon: string;

    /**
     * 图片位置  left top right bottom
     */
    iconPos: string = ICONPOS.LEFT;

    /**
     * 背景透明
     */
    nobg: boolean;

    /**
     * 按钮文本 内容 
     */
    text: string;
    /**
     * 主题 active error warn success
     */
    theme: string;
    /**
     * 按钮触发的事件
     */
    clickEvent: string;


    constructor(params: Element | IUIButtonCfg, parent?: Element) {
        super(params);
        let element = new Element();
        if (params instanceof Element) {
            element = params;
            UITool.handleUIParam(element, this,
                ['size', 'icon', 'iconpos', 'theme', 'nobg|bool'],
                ['size', 'icon', 'iconPos', 'theme', 'nobg'],
                [SIZE.NORMAL, '', ICONPOS.LEFT, '', null]
            );
            if (element.children.length > 0 && element.children[0].textContent) {
                this.text = <string>element.children[0].textContent;
            } else {
                this.text = ''
            }

        } else {
            // 传入的是配置对象，那么按照配置对象来生成插件
            Object.keys(params).forEach(key => {
                this[key] = params[key]
            })
        }
        this.generate(element);
        element.tagName = 'button';
        element.defineEl = this;
        this.element = element;
    }

    /**
     * 生成插件的内容
     * @param rootDom 插件产生的虚拟dom
     */
    private generate(rootDom: Element) {

        let clsArr: string[] = ['nd-btn'];
        //图标大小
        clsArr.push('nd-btn-' + this.size);

        //图标位置
        if (this.iconPos && this.iconPos !== '') {
            clsArr.push('nd-btn-' + this.iconPos);
        }

        if (this.nobg) {
            clsArr.push('nd-btn-nobg');
        } else if (this.theme && this.theme !== '') {
            clsArr.push('nd-btn-' + this.theme);
        }

        //是否无文本
        if (this.text && this.text === '') {
            clsArr.push('nd-btn-notext');
        }

        //把btn类加入到class
        rootDom.addClass(clsArr.join(' '));

        // 给按键绑定按下事件
        if (this.clickEvent) {
            rootDom.addEvent(new NEvent('click', this.clickEvent));
        }

        //只要文本
        let txt: Element = new Element();
        txt.textContent = this.text;

        let children = [txt];
        //图标element
        if (this.icon !== '') {
            let img: Element = new Element('b');
            img.addClass('nd-icon-' + this.icon);
            switch (this.iconPos) {
                case 'left':
                    children.unshift(img);
                    break;
                case 'top':
                    children.unshift(img);
                    img.addClass('nd-btn-vert');
                    break;
                case 'right':
                    children.push(img);
                    break;
                case 'bottom':
                    children.push(img);
                    img.addClass('nd-btn-vert');
                    break;
            }
        }
        rootDom.children = children;
    }
}



DefineElementManager.add('UI-BUTTON', {
    init: function (element: Element, parent?: Element) {
        new UIButton(element, parent)
    }
});
