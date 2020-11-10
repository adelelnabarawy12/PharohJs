
var Pharoh = {
    Apps: [],
    Controllers: [],
    Scopes: [],
    Views: [],
    Forms: [],
    Validations: [],
    Compile: function ($context = { text: document.body.innerHTML }, $Domain) {
        let txt = $context.text.trim();
        let head = document.head.innerHTML;
        Object.getOwnPropertyNames($Domain).forEach(function (varName) {
            const compilePattern = new RegExp(`#{[ ]{0,}${varName}[ ]{0,}}`, 'g');
            txt = txt.replace(compilePattern, $Domain[varName]);
            head = head.replace(compilePattern, $Domain[varName]);
        });
        document.body.innerHTML = txt;
        document.head.innerHTML = head;
    },
    CompileView: function ($context = { text: document.body.innerHTML }, viewModel = {}) {
        let txt = $context.text.trim();
        Object.getOwnPropertyNames(viewModel).forEach(function (varName) {
            const compilePattern = new RegExp(`#{[ ]{0,}${varName}[ ]{0,}}`, 'g');
            txt = txt.replace(compilePattern, viewModel[varName]);
        });
        return txt;
    },
    Controller: function (controllerLogic = function ($domain) {}){
        $domain = {};
        controllerLogic($domain);
        Pharoh.Compile({ text: document.body.innerHTML }, $domain);
        Pharoh.Controllers.push({
            name: `c${Pharoh.Controllers.length}`,
            logic: controllerLogic,
            domain: $domain,
        });
    },
    Scope: function (scopeObject = { name: "" , scopeLogic: function ($Domain) {} }){
        $Domain = {};
        scopeObject.scopeLogic($Domain);
        var pharohScopes = document.body.querySelectorAll("scope");
        var scopeDom;
        pharohScopes.forEach(function (scope){
            let scopeName = scope.attributes["scope-name"].value;
            if (scopeObject.name == scopeName){
                scope.innerHTML = Pharoh.CompileView({ text: scope.innerHTML }, $Domain);
                scopeDom = scope;
            }
        });

        Pharoh.Scopes.push({
            name: scopeObject.name,
            logic: scopeObject.scopeLogic,
            domain: $Domain,
            scopeDom: scopeDom
        });
    },
    View: function (viewObject = { name: "", html: "", model: {}}){
        var pharohViews = document.body.querySelectorAll("view");
        var viewDom;
        if (viewObject.model == undefined) {
            pharohViews.forEach(function(view) {
                let viewName = view.attributes["view-name"].value;
                if (viewObject.name == viewName){
                    view.innerHTML = viewObject.html;
                    viewDom = view;
                }
            });
            
            Pharoh.Controllers.forEach(function(controller) {
                Pharoh.Compile({ text: document.body.innerHTML }, controller.domain);
            });
        }
        else{
            pharohViews.forEach(function(view) {
                let viewName = view.attributes["view-name"].value;
                if (viewObject.name == viewName){
                    view.innerHTML = Pharoh.CompileView({ text: viewObject.html }, viewObject.model);
                    viewDom = view;
                }
            });
        }

        Pharoh.Views.push({
            name: viewObject.name,
            html: viewObject.html,
            model: viewObject.model,
            viewDom: viewDom,
        });
    },
    Iterator: function (iteratorOptions = {viewName: "", models: [], appendOn: false}){
        var view = undefined;
        iteratorOptions.appendOn = iteratorOptions.appendOn == undefined ? false : iteratorOptions.appendOn;
        Pharoh.Views.forEach(function (viewItem){
            if (viewItem.name == iteratorOptions.viewName) {
                view = viewItem;
            }
        });

        if (view == undefined) {
            console.error(`Pharoh: There is no View has name = ${iteratorOptions.viewName}!`);
        }
        else {
            if (!iteratorOptions.appendOn) {
                document.body.querySelector(`view[view-name="${iteratorOptions.viewName}"]`).innerHTML = "";
            }

            iteratorOptions.models.forEach(function (obj) {
                document.body.querySelector(`view[view-name="${iteratorOptions.viewName}"]`).innerHTML += (Pharoh.CompileView({ text: view.html }, obj));
            });
        }
    },
    Http: function (options = { url: "", method: "", data: {}, headers: {}, callBack: function() {} }) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200) {
                options.callBack(this.responseText);
            }
        }
        options.data = options.data == undefined ? {} : options.data;
        xhttp.open(options.method, options.url, true);
        if (options.headers != undefined) {
            Object.getOwnPropertyNames(options.headers).forEach(function(headerItem){
                xhttp.setRequestHeader([headerItem], options.headers[headerItem]);
            });
        }
        let serializeText = "";
        if (options.data != undefined) {
            serializeText = Pharoh.Serialize(options.data);
        }
        xhttp.send(serializeText);
    },
    Serialize: function(data = {}){
        let flag = true;
        let serializeText = "";
        Object.getOwnPropertyNames(data).forEach(function(dataItem){
            if (flag) {
                serializeText +=  `${[dataItem]}=${data[dataItem]}`;
                flag = false;
            }
            else{
                serializeText +=  `&${[dataItem]}=${data[dataItem]}`;
            }
        });
        return serializeText;
    }
}





