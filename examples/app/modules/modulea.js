/**
 * 模块A
 */
class ModuleA extends nodom.Module {
    constructor(cfg) {
        let config = nodom.Util.merge(cfg, {
            template: `
                <p>折扣：{{vip}}</p>
                <button e-click='addData'>添加</button>
                <ul>
                    <li x-repeat='foods'>{{name}}</li>
                </ul>
            `,
            methods: {
                addData: function (dom,model) {
                    model.data.foods.push({ id: 4, name: '烤羊蹄', price: '58' });
                    // model.data.vip = 0.5;
                }
            }
        });
        super(config);
    }
}
//# sourceMappingURL=modulea.js.map