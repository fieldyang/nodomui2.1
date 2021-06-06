import { DefineElementManager, Directive, Element, Module, Util } from "nodom";
import { UILayout } from "./layout";
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
        new Directive('model', this.extraDataName, rootDom)
        console.log(11);
        let ui = new UILayout({
            customTemplate:
                `
            				<!--北-->
				<div
					north
					style="
						line-height: 60px;
						height: 60px;
						text-align: center;
						font-size: 20px;
						background-color: #333;
						color: #fff;
					"
				>
					这是Nodom Layout测试
				</div>
				<!--西-->
				<div west style="width: 300px" title="功能选择" allowMin>
					<ui-accordion>
						<div first data="levels" icon="pulldown pullup" activeName="active">{{title}}</div>
						<a second data="rows">{{name}}</a>
					</ui-accordion>
				</div>
				<!--中-->
				<div center>
					<ui-panel class="panel" title="测试panel" buttons="min,max,close" style="height: 100%">
						<ui-toolbar>
							<ui-button nobg icon="menu"></ui-button>
							<ui-button nobg right icon="arrow-down">颜色</ui-button>
							<ui-button nobg icon="search"></ui-button>
							<ui-button nobg icon="ashbin"></ui-button>
						</ui-toolbar>
						<ui-buttongroup>
							<ui-button theme="active" icon="add">添加</ui-button>
							<ui-button theme="error" icon="ashbin">删除</ui-button>
							<ui-button theme="warn" icon="edit">编辑</ui-button>
							<ui-button icon="search">查询</ui-button>
						</ui-buttongroup>

						<div>hello world!</div>
						<p>这是一个panel</p>
					</ui-panel>
				</div>
				<!--东-->
				<div east style="width: 250px" title="辅助功能" allowMin>
					<ui-list x-field="list" listField="lists" valueField="hid" type="col">
						<div style="width: 60px; text-align: center">
							<b class="nd-icon-{{icon}}" style="font-size: 30px"></b>
							<div>{{htitle}}</div>
						</div>
					</ui-list>
				</div>
				<!--南-->
				<div
					south
					class="south"
					style="
						padding: 10px;
						line-height: 30px;
						text-align: center;
						font-size: 14px;
						background-color: #333;
						color: #fff;
					"
				>
					nodom团队@版权所有<br />
					邮箱：nodomjs@aliyun.com
				</div>
                `
        })
        new Directive('model', '$$', ui.element)
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
