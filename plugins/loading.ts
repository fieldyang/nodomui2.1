import { DefineElementManager, Directive, Element, Module, ModuleFactory, Util } from "nodom";
import { pluginBase } from "./pluginBase";
import { UITool } from "./uibase";

/**
 * loading
 */
class UILoading extends pluginBase {
    tagName: string = 'UI-LOADING';

    /**
     * 显示字段
     */
    dataName: string;
    /**
     * 显示标志
     */
    showFlag: boolean;

    /**
     * canvas
     */
    canvas: HTMLCanvasElement;

    /**
     * 主题
     */
    theme: string;

    /**
     * 移动圆圈半径
     */
    private moveCircle: number;

    /**
     * 显示数，每open一次，+1，每close一次，-1。close时检查是否为0，为0则关闭
     */
    private openCount: number = 0;
    /**
     * 开始角
     */
    startAngle: number;

    constructor(params: Element, parent?: Element) {
        super(params);

        UITool.handleUIParam(params, this,
            ['startangle|number', 'movecircle|number'],
            ['startAngle', 'moveCircle'],
            [Math.PI / 2, 40]);

        this.generate(params);
        params.tagName = 'div';
        params.defineEl = this;
        this.element = params;
    }

    /**
     * 生成插件的内容
     * @param rootDom 插件产生的虚拟dom
     * @param genMode 生成虚拟dom的方式，true:ast编译的模板的方式，false:传入配置对象的方式
     */
    private generate(rootDom: Element) {
        rootDom.setProp('name', '$ui-loading');
        this.dataName = '$ui_loading_' + Util.genId();
        rootDom.addClass('nd-loading');

        rootDom.addDirective(new Directive('class', "{'nd-loading-hide':'!" + this.dataName + "'}", rootDom));
        //蒙版
        let coverDom: Element = new Element('div');
        coverDom.addClass('nd-loading-cover');
        rootDom.add(coverDom);
        let body = new Element('div');
        body.addClass('nd-loading-body');
        let canvas = new Element('canvas');
        canvas.setProp('width', 100);
        canvas.setProp('height', 100);
        body.add(canvas);
        rootDom.add(body);
    }

    /**
     * 打开loading
     */
    public open() {
        const me = this;
        me.openCount++;
        ModuleFactory.getMain().model[this.dataName] = true;
        let canvas: any = document.querySelector("[key='" + this.element.children[1].children[0].key + "']");
        let width = canvas.offsetWidth;
        let circleCount = 6;
        me.showFlag = true;

        setTimeout(() => {
            loop();
        }, 500);

        function loop() {
            if (!me.showFlag) {
                return;
            }

            let ctx = canvas.getContext('2d');

            let centerx = width / 2;
            let centery = width / 2;
            let radius1 = 6;
            let radius = me.moveCircle;
            let angle = me.startAngle;

            let circleArr = [];
            loop1();
            setTimeout(loop, 1500);

            function loop1() {
                if (!me.showFlag) {
                    return;
                }
                ctx.clearRect(0, 0, width, width);
                ctx.fillStyle = 'gold';

                if (circleArr.length < circleCount) {
                    circleArr.push(true);
                }
                angle += Math.PI / 8;

                let overNum = 0;

                for (let i = 0; i < circleArr.length; i++) {
                    let a = angle - i * Math.PI / 8;
                    if (a > Math.PI * 2 + me.startAngle) {
                        overNum++;
                        a = Math.PI * 2 + me.startAngle;
                    }
                    let r = radius1 - i;

                    ctx.beginPath();
                    ctx.arc(centerx - radius * Math.cos(a), centery - radius * Math.sin(a), r, 0, 360);
                    ctx.closePath();
                    ctx.fill();
                }
                if (overNum < circleCount) {
                    setTimeout(loop1, 60);
                }
            }
        }
    }

    /**
     * 关闭loading
     */
    public close() {
        if (--this.openCount === 0) {
            ModuleFactory.getMain().model[this.dataName] = false;
            this.showFlag = false;
        }
    }
}

DefineElementManager.add('UI-LOADING', {
    init: function (element: Element, parent?: Element) {
        new UILoading(element, parent);
    }
});

/**
 * 显示loading
 */
export function showLoading() {
    let manager: UILoading = <UILoading>ModuleFactory.getMain().getElement({ name: '$ui-loading', type: 'defineelement' });
    //新建manager
    if (manager) {
        manager.open();
    }
}

/**
 * 关闭loading
 */
export function closeLoading(config: any) {
    let module: Module = ModuleFactory.getMain();
    if (!module) {
        return null;
    }
    let manager: UILoading = <UILoading>module.getElement({ name: '$ui-loading', type: 'defineelement' });
    //新建manager
    if (manager) {
        manager.close();
    }
}

