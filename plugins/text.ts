import { DefineElement, DefineElementManager, Directive, Element, UITool } from 'nodom';

/**
 * text 插件
 * 
 */
// class UIText extends DefineElement {
//     tagName: string = 'UI-TEXT';

//     /**
//      * select绑定的数据字段名
//      */
//     dataName: string;

//     /**
//      * 图标
//      */
//     icon: string;
//     /**
//      * 图标位置 left,right
//      */
//     iconPos: string;

//     constructor(params: HTMLElement | object | Element) {
//         super(params);
//         let rootDom: Element = new Element();
//         if (params instanceof Element) {
//             rootDom = params;
//             UITool.handleUIParam(rootDom, this,
//                 ['icon', 'iconpos'],
//                 ['icon', 'iconPos'],
//                 ['', 'left']
//             );
//             this.generate(rootDom);
//             rootDom.tagName = 'div';
//             this.element = rootDom;
//         } else if (typeof params === 'object') {
//             for (let o in params) {
//                 this[o] = params[o];
//             }
//         }
//     }

//     /**
//      * 产生插件内容
//      * @param rootDom 插件对应的element
//      */
//     private generate(rootDom: Element) {
//         rootDom.addClass('nd-text');
//         //生成id
//         let field = rootDom.getDirective('field');
//         let input: Element = new Element('input');
//         input.setProp('type', 'text');

//         rootDom.add(input);

//         //替换directive到input
//         input.addDirective(new Directive('field', field.value, input));

//         let vProp = rootDom.getProp('value');
//         if (!vProp) {
//             vProp = rootDom.getProp('value', true);
//             input.setProp('value', vProp, true);
//         } else {
//             input.setProp('value', vProp);
//         }


//         //清除rootDom的指令和事件
//         rootDom.removeDirectives(['field']);
//         rootDom.events.clear();

//         if (this.icon !== '') {
//             let icon: Element = new Element('b');
//             icon.addClass('nd-icon-' + this.icon);
//             if (this.iconPos === 'left') {
//                 icon.addClass('nd-text-iconleft');
//                 rootDom.children.unshift(icon);
//             } else {
//                 rootDom.add(icon);
//             }
//         }
//     }
//     /**
//      * 后置渲染
//      * @param module 
//      * @param dom 
//      */
//     beforeRender(module: Module, dom: Element) {
//         super.beforeRender(module, dom);
//     }
// }

function UITextInit(element: Element, parent?: Element) {
    let uitext = new DefineElement(element);
    console.log(element);

    UITool.handleUIParam(element, uitext,
        ['icon', 'iconpos'],
        ['icon', 'iconPos'],
        ['', 'left']
    );
    generate(uitext, element);
    element.tagName = 'div';
    uitext.element = element;
    return uitext;
}

function generate(uitext: DefineElement, element: Element) {
    element.addClass('nd-text');
    //生成id
    let field = element.getDirective('field');
    let input: Element = new Element('input');
    input.setProp('type', 'text');

    element.add(input);

    //替换directive到input
    input.addDirective(new Directive('field', field.value, input));

    let vProp = element.getProp('value');
    if (!vProp) {
        vProp = element.getProp('value', true);
        input.setProp('value', vProp, true);
    } else {
        input.setProp('value', vProp);
    }


    //清除rootDom的指令和事件
    element.removeDirectives(['field']);
    element.events.clear();

    // if (uitext.icon !== '') {
    //     let icon: Element = new Element('b');
    //     icon.addClass('nd-icon-' + uitext.icon);
    //     if (uitext.iconPos === 'left') {
    //         icon.addClass('nd-text-iconleft');
    //         element.children.unshift(icon);
    //     } else {
    //         element.add(icon);
    //     }
    // }
}

DefineElementManager.add('UI-TEXT', {
    init: function (element: Element, parent?: Element) {
        return UITextInit(element, parent);
    }
})
