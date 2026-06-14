// https://github.com/AleCucina/chrome-extension-remote-scripts

function isIterable(obj) {
    return obj !== null && typeof obj[Symbol.iterator] === 'function';
}

function isPromise(x) {
    return x && typeof x.then === 'function';
}

function setVariable(scope, varName, value) {
    let current = scope; while (current) { if (Object.prototype.hasOwnProperty.call(current, varName)) { current[varName] = value; return; } current = Object.getPrototypeOf(current); } scope[varName] = value;
}

export async function executeAST(ast) {

    async function assignPattern(pattern, value, scope) {
        switch (pattern.type) {
            case 'Identifier':
                setVariable(scope, pattern.name, value);
                return;

            case 'AssignmentPattern': {
                let v = value === undefined ? await exec(pattern.right, scope) : value;
                await assignPattern(pattern.left, v, scope);
                return;
            }

            case 'ArrayPattern': {
                let arr = value ?? [];
                for (let i = 0; i < pattern.elements.length; i++) {
                    let el = pattern.elements[i];
                    if (!el) { continue; }
                    if (el.type === 'RestElement') {
                        await assignPattern(el.argument, arr.slice(i), scope);
                        break;
                    }
                    if (el.type === 'AssignmentPattern') {
                        let v = arr[i] === undefined ? await exec(el.right, scope) : arr[i];
                        await assignPattern(el.left, v, scope);
                    } else {
                        await assignPattern(el, arr[i], scope);
                    }
                }
                return;
            }

            case 'ObjectPattern': {
                let obj = value ?? {};
                let pickedKeys = new Set();
                for (let prop of pattern.properties) {
                    if (prop.type === 'Property') {
                        let key = prop.key.type === 'Identifier'
                            ? prop.key.name
                            : await exec(prop.key, scope);
                        pickedKeys.add(key);

                        let target = prop.value;
                        let v = obj[key];
                        if (target.type === 'AssignmentPattern') {
                            v = v === undefined ? await exec(target.right, scope) : v;
                            await assignPattern(target.left, v, scope);
                        } else {
                            await assignPattern(target, v, scope);
                        }
                    }
                }
                let restProp = pattern.properties.find(p => p.type === 'RestElement');
                if (restProp) {
                    let rest = {};
                    for (let k of Object.keys(obj)) {
                        if (!pickedKeys.has(k)) { rest[k] = obj[k]; }
                    }
                    await assignPattern(restProp.argument, rest, scope);
                }
                return;
            }

            default:
                throw new Error(`Unsupported pattern type: ${pattern.type}`);
        }
    }

    let baseScope = {

        globalThis,
        console,
        Math,
        undefined,

        fetch,
        decodeURI,
        decodeURIComponent,
        alert,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        atob,
        btoa,
        encodeURIComponent,

        Number,
        String,
        Boolean,
        Array,
        Date,
        RegExp,
        URLSearchParams,
        Error,
        DOMParser,
        Promise,
        Event,
        URL,

        JSON,
        window,
        navigator,
        localStorage,
        document,

        'setTimeout': (...args) => window.setTimeout(...args),
        'clearTimeout': (...args) => window.clearTimeout(...args),
        'setInterval': (...args) => window.setInterval(...args),
        'clearInterval': (...args) => window.clearInterval(...args),
        'location': window.location,

        'Object': {
            'assign': Object.assign,
            'create': Object.create,
            'defineProperties': Object.defineProperties,
            'defineProperty': Object.defineProperty,
            'entries': Object.entries,
            'freeze': Object.freeze,
            'fromEntries': Object.fromEntries,
            'getOwnPropertyDescriptor': Object.getOwnPropertyDescriptor,
            'getOwnPropertyDescriptors': Object.getOwnPropertyDescriptors,
            'getOwnPropertyNames': Object.getOwnPropertyNames,
            'getPrototypeOf': Object.getPrototypeOf,
            'is': Object.is,
            'isExtensible': Object.isExtensible,
            'isFrozen': Object.isFrozen,
            'isSealed': Object.isSealed,
            'keys': Object.keys,
            'preventExtensions': Object.preventExtensions,
            'seal': Object.seal,
            'setPrototypeOf': Object.setPrototypeOf,
            'values': Object.values,
        },

        'chrome': new Proxy(chrome, {
            get(target, prop) {
                let val = target[prop];
                if (typeof val === 'function') { return val.bind(target); }
                if (val !== null && typeof val === 'object') { return val; } // Permite acessar sub-propriedades como chrome.storage.local
                return val;
            },
        }),

    };

    async function exec(node, scope) {
        if (node === null) { return; }

        switch (node.type) {

            case 'Identifier': {
                if (node.name in scope) { return scope[node.name]; }
                if (node.name in globalThis) { return globalThis[node.name]; }
                throw new ReferenceError(`${node.name} is not defined`);
            }

            case 'Program': {
                // PRIMEIRO PASSO: Registrar as funções no escopo e no globalThis
                for (let stmt of node.body) {
                    // Tratamos FunctionDeclaration normal OU ExportNamedDeclaration (MODO B)
                    let isExport = stmt.type === 'ExportNamedDeclaration';
                    let declaration = isExport ? stmt.declaration : stmt;

                    if (declaration && declaration.type === 'FunctionDeclaration') {
                        let name = declaration.id.name;

                        // Cria a função dentro do interpretador
                        scope[name] = async function (...argsValues) {
                            let fnScope = Object.create(scope);
                            for (let [i, param,] of declaration.params.entries()) {
                                if (param.type === 'RestElement') {
                                    await assignPattern(param.argument, argsValues.slice(i), fnScope);
                                } else {
                                    await assignPattern(param, argsValues[i], fnScope);
                                }
                            }
                            try {
                                return await exec(declaration.body, fnScope);
                            } catch (e) {
                                if (e.__return) { return e.value; }
                                throw e;
                            }
                        };

                        // INJEÇÃO AUTOMÁTICA: Faz a função existir no Chrome (globalThis)
                        globalThis[name] = scope[name];
                    }
                }

                // SEGUNDO PASSO: Executar o restante do código (atribuições, chamadas, etc)
                let result;
                for (let stmt of node.body) {
                    // Se for apenas o export, não precisamos "executar" de novo, já registramos acima
                    if (stmt.type === 'ExportNamedDeclaration') { continue; }

                    try {
                        result = await exec(stmt, scope);
                    } catch (e) {
                        if (e.__return) { return e.value; }
                        throw e;
                    }
                }
                return result;
            }

            case 'ExpressionStatement':
                return await exec(node.expression, scope);

            case 'Literal':
                if (typeof node.regex === 'object' && node.regex !== null) {
                    let { pattern, flags, } = node.regex;
                    return new RegExp(pattern, flags || '');
                }
                return node.value;

            case 'UpdateExpression': {
                let arg = node.argument;

                if (arg.type !== 'Identifier') {
                    throw new Error('UpdateExpression supporta solo Identifier come argomento');
                }

                let varName = arg.name;

                if (!(varName in scope)) {
                    throw new ReferenceError(`Variabile non definita: ${varName}`);
                }

                if (typeof scope[varName] !== 'number') {
                    throw new TypeError(`UpdateExpression supporta solo numeri. Got: ${typeof scope[varName]}`);
                }

                let oldValue = scope[varName];

                if (node.operator === '++') {
                    scope[varName]++;
                } else if (node.operator === '--') {
                    scope[varName]--;
                } else {
                    throw new Error(`Unsupported update operator: ${node.operator}`);
                }

                return node.prefix ? scope[varName] : oldValue;
            }

            case 'NewExpression': {
                let constructor = await exec(node.callee, scope);
                let args = await Promise.all(node.arguments.map(arg => exec(arg, scope)));
                if (typeof constructor !== 'function') {
                    throw new TypeError(`NewExpression: '${node.callee.type}' non è una funzione costruttrice. Got: ${typeof constructor}`);
                }
                return new constructor(...args);
            }

            case 'TemplateLiteral': {
                let parts = node.quasis.map((q) => q.value.cooked);
                let expressions = await Promise.all(node.expressions.map(expr => exec(expr, scope)));
                let result = '';
                for (let i = 0; i < parts.length; i++) {
                    result += parts[i];
                    if (i < expressions.length) { result += expressions[i]; }
                }
                return result;
            }

            case 'VariableDeclaration': {
                for (let decl of node.declarations) {
                    let initVal = decl.init ? await exec(decl.init, scope) : undefined;
                    await assignPattern(decl.id, initVal, scope);
                }
                return;
            }

            case 'ChainExpression': {
                return await exec(node.expression, scope);
            }

            case 'CallExpression': {
                if (node.callee.type === 'MemberExpression') {
                    let member = node.callee;
                    let obj = await exec(member.object, scope);

                    if (typeof obj === 'string' || obj instanceof String) {
                        let prop = member.computed ? await exec(member.property, scope) : member.property.name;
                        if (prop === 'includes') {
                            let arg0 = node.arguments[0] ? await exec(node.arguments[0], scope) : undefined;
                            try {
                                let res = obj.includes(arg0);
                                return res;
                            } catch (e) {
                                throw e;
                            }
                        }
                    }

                    let isNodeList = (x) =>
                        typeof NodeList !== 'undefined' && (x instanceof NodeList || x instanceof HTMLCollection);

                    if (isNodeList(obj)) {
                        let prop = member.computed ? await exec(member.property, scope) : member.property.name;
                        if (prop === 'forEach') {
                            let cb = await exec(node.arguments[0], scope);
                            let thisArg = node.arguments[1] ? await exec(node.arguments[1], scope) : undefined;
                            for (let i = 0; i < obj.length; i++) {
                                let r = cb.call(thisArg, obj[i], i, obj);
                                if (isPromise(r)) { await r; }
                            }
                            return undefined;
                        }
                    }

                    if (Array.isArray(obj)) {
                        let prop = member.computed
                            ? await exec(member.property, scope)
                            : member.property.name;

                        let orig = obj[prop];
                        if (typeof orig !== 'function') {
                            throw new TypeError(`'${prop}' non è una funzione su Array`);
                        }

                        let args = [];
                        for (let arg of node.arguments) {
                            if (arg.type === 'SpreadElement') {
                                let spread = await exec(arg.argument, scope);
                                if (!Array.isArray(spread)) {
                                    throw new TypeError('SpreadElement deve essere un array');
                                }
                                args.push(...spread);
                            } else {
                                args.push(await exec(arg, scope));
                            }
                        }

                        if (typeof args[0] === 'function') {
                            let cb = args[0];
                            let thisArg = args[1];

                            let callCb = async (el, i) => {
                                try {
                                    let r = cb.call(thisArg, el, i, obj);
                                    if (isPromise(r)) {
                                        try {
                                            r = await r;
                                        } catch (err) {
                                            return false;
                                        }
                                    }
                                    return r;
                                } catch (err) {
                                    return false;
                                }
                            };

                            switch (prop) {
                                case 'find': {
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = await callCb(obj[i], i);
                                        if (r) {
                                            return obj[i];
                                        }
                                    }
                                    return undefined;
                                }
                                case 'findIndex': {
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = await callCb(obj[i], i);
                                        if (r) { return i; }
                                    }
                                    return -1;
                                }
                                case 'some': {
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = await callCb(obj[i], i);
                                        if (r) { return true; }
                                    }
                                    return false;
                                }
                                case 'every': {
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = await callCb(obj[i], i);
                                        if (!r) { return false; }
                                    }
                                    return true;
                                }
                                case 'filter': {
                                    let out = [];
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = await callCb(obj[i], i);
                                        if (r) { out.push(obj[i]); }
                                    }

                                    return out;
                                }
                                case 'map': {
                                    let out = new Array(obj.length);
                                    for (let i = 0; i < obj.length; i++) {
                                        out[i] = await callCb(obj[i], i);
                                    }

                                    return out;
                                }
                                case 'reduce': {
                                    let start = 0;
                                    let acc;
                                    if (args.length >= 2) { acc = args[1]; }
                                    else {
                                        if (obj.length === 0) { throw new TypeError('Reduce of empty array with no initial value'); }
                                        acc = obj[0]; start = 1;
                                    }
                                    for (let i = start; i < obj.length; i++) {
                                        let r = cb.call(thisArg, acc, obj[i], i, obj);

                                        acc = isPromise(r) ? await r : r;

                                    }
                                    return acc;
                                }
                                case 'forEach': {
                                    for (let i = 0; i < obj.length; i++) {
                                        let r = cb.call(thisArg, obj[i], i, obj);
                                        if (isPromise(r)) { await r; }
                                    }
                                    return undefined;
                                }
                            }
                        }

                        return orig.apply(obj, args);
                    }


                    if (member.optional && (obj === null || obj === undefined)) {
                        return undefined;
                    }

                    let prop = member.computed
                        ? await exec(member.property, scope)
                        : member.property.name;

                    if (obj === null || obj === undefined) {
                        throw new TypeError(`Impossibile accedere al metodo '${prop}' di ${obj}`);
                    }

                    let fn = obj[prop];

                    if (member.optional && fn === undefined) {
                        return undefined;
                    }

                    if (typeof fn !== 'function') {
                        throw new TypeError(`'${prop}' non è una funzione`);
                    }

                    let args = [];
                    for (let arg of node.arguments) {
                        if (arg.type === 'SpreadElement') {
                            let spread = await exec(arg.argument, scope);
                            if (!Array.isArray(spread)) {
                                throw new TypeError('SpreadElement deve essere un array');
                            }
                            args.push(...spread);
                        } else {
                            args.push(await exec(arg, scope));
                        }
                    }

                    return fn.apply(obj, args);
                }

                let fn = await exec(node.callee, scope);
                let args = await Promise.all(node.arguments.map(arg => exec(arg, scope)));

                if (typeof fn !== 'function') {
                    let name = 'Desconhecido';
                    if (node.callee.type === 'Identifier') {
                        name = node.callee.name;
                    } else if (node.callee.type === 'MemberExpression') {
                        name = node.callee.property.name || 'Propriedade Dinâmica';
                    }
                    throw new ReferenceError(`${name} is not defined`);
                }

                return fn(...args);
            }

            case 'ClassDeclaration': {
                let className = node.id.name;
                let classBody = node.body.body;

                let constructorFunction = null;

                let classObj = function (...args) {
                    let instance = Object.create(classObj.prototype);
                    if (constructorFunction) {
                        constructorFunction.apply(instance, args);
                    }
                    return instance;
                };

                for (let method of classBody) {
                    if (!method || method.type !== 'MethodDefinition' || !method.key || !method.value) { continue; }

                    let methodName = method.key.name;
                    let methodFn = async function (...argsValues) {
                        let methodScope = Object.create(scope);
                        method.value.params.forEach((param, i) => {
                            methodScope[param.name] = argsValues[i];
                        });
                        methodScope.this = this;
                        try {
                            return await exec(method.value.body, methodScope);
                        } catch (e) {
                            if (e.__return) { return e.value; }
                            throw e;
                        }
                    };

                    if (method.kind === 'constructor') {
                        constructorFunction = methodFn;
                    } else if (method.static) {
                        classObj[methodName] = methodFn;
                    } else {
                        classObj.prototype[methodName] = methodFn;
                    }
                }

                scope[className] = classObj;
                return;
            }

            case 'MemberExpression': {
                let obj;

                try {
                    obj = await exec(node.object, scope);
                } catch (e) {
                    if (node.optional) {
                        return undefined;
                    } else {
                        throw e;
                    }
                }

                if (node.optional && (obj === null || obj === undefined)) {
                    return undefined;
                }

                let prop = node.computed ? await exec(node.property, scope) : node.property.name;

                if (obj !== null && typeof obj !== 'object') {
                    if (typeof obj === 'string') { obj = new String(obj); }
                    else if (typeof obj === 'number') { obj = new Number(obj); }
                    else if (typeof obj === 'boolean') { obj = new Boolean(obj); }
                }

                if (obj === null) {
                    throw new TypeError(`Impossibile accedere a proprietà '${prop}' di ${obj}`);
                }

                let value = obj[prop];
                if (typeof value === 'function') {
                    if (Array.isArray(obj)) {
                        return (...args) => {
                            if (args.length > 0 && typeof args[0] === 'function') {
                                return value.call(obj, (...callbackArgs) => {
                                    return args[0].apply(obj, callbackArgs);
                                });
                            }
                            return value.apply(obj, args);
                        };
                    }
                    return value.bind(obj);
                }
                return value;
            }

            case 'AwaitExpression':
                return Promise.resolve(await exec(node.argument, scope));

            case 'BlockStatement': {
                for (let stmt of node.body) {
                    let result = await exec(stmt, scope);
                    if (result && result.__return) { throw result; }
                }
                return;
            }

            case 'TryStatement': {
                try {
                    return await exec(node.block, scope);
                } catch (err) {
                    // SE FOR UM SINAL DE CONTROLE, REPASSA DIRETO (IGNORA O CATCH DO USUÁRIO)
                    if (err && (err.__return || err.__break || err.__continue)) {
                        throw err;
                    }

                    // SE FOR UM ERRO REAL, AÍ SIM EXECUTA O CATCH DO USUÁRIO
                    if (node.handler) {
                        let newScope = Object.create(scope);
                        if (node.handler.param?.name) {
                            newScope[node.handler.param.name] = err;
                        }
                        return await exec(node.handler.body, newScope);
                    }

                    // Se não houver catch (handler), mas houver erro real, joga pra frente
                    if (!node.finalizer) { throw err; }
                } finally {
                    if (node.finalizer) {
                        await exec(node.finalizer, scope);
                    }
                }
                return;
            }

            case 'ReturnStatement':
                throw { '__return': true, 'value': await exec(node.argument, scope), };

            case 'IfStatement':
                return await exec(node.test, scope) ? await exec(node.consequent, scope) : node.alternate ? await exec(node.alternate, scope) : undefined;

            case 'BinaryExpression': {
                let left = await exec(node.left, scope);
                let right = await exec(node.right, scope);
                switch (node.operator) {
                    case '==': return left === right;
                    case '===': return left === right;
                    case '!=': return left !== right;
                    case '!==': return left !== right;
                    case '<': return left < right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '>=': return left >= right;
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                    case '%': return left % right;
                    case 'instanceof': return left instanceof right;
                    case '**': return left ** right;
                    case '&': return left & right;
                    case '|': return left | right;
                    case '^': return left ^ right;
                    case '<<': return left << right;
                    case '>>': return left >> right;
                    case '>>>': return left >>> right;
                    case 'in': return left in right;

                    default: throw new Error(`Unsupported operator: ${node.operator}`);
                }
            }

            case 'DoWhileStatement': {
                do {
                    try {
                        await exec(node.body, scope);
                    } catch (e) {
                        if (e.__break) { break; }
                        if (e.__continue) { continue; }
                        throw e;
                    }
                } while (await exec(node.test, scope));
                return;
            }

            case 'LogicalExpression': {
                let left = await exec(node.left, scope);

                switch (node.operator) {
                    case '&&':
                        return left ? await exec(node.right, scope) : left;
                    case '||':
                        return left ? left : await exec(node.right, scope);
                    case '??':
                        return left !== null && left !== undefined ? left : await exec(node.right, scope);
                    default:
                        throw new Error(`Unsupported logical operator: ${node.operator}`);
                }
            }

            case 'UnaryExpression': {
                let argNode = node.argument;

                if (node.operator === 'delete') {
                    if (argNode.type === 'MemberExpression') {
                        let obj = await exec(argNode.object, scope);
                        let prop = argNode.computed ? await exec(argNode.property, scope) : argNode.property.name;
                        return delete obj[prop];
                    }
                    return true;
                }

                let argValue = await exec(argNode, scope);
                switch (node.operator) {
                    case '!': return !argValue;
                    case '-': return -argValue;
                    case '+': return +argValue;
                    case 'typeof': return typeof argValue;
                    case '~': return ~argValue;
                    default: throw new Error(`Unsupported unary operator: ${node.operator}`);
                }
            }

            case 'SequenceExpression': {
                let result;
                for (let expr of node.expressions) {
                    result = await exec(expr, scope);
                }
                return result;
            }

            case 'AssignmentExpression': {
                let op = node.operator;

                // 1. Função auxiliar para obter a referência do lado esquerdo
                let getRef = async (left) => {
                    if (left.type === 'Identifier') { return { 'kind': 'id', 'name': left.name, }; }
                    if (left.type === 'MemberExpression') {
                        let obj = await exec(left.object, scope);
                        let prop = left.computed ? await exec(left.property, scope) : left.property.name;
                        return { 'kind': 'mem', obj, prop, };
                    }
                    // Para desestruturação: [a, b] = ... ou {x} = ...
                    return { 'kind': 'pattern', 'pattern': left, };
                };

                let ref = await getRef(node.left);

                // 2. Se for atribuição direta (=), usamos o assignPattern para tudo
                if (op === '=') {
                    let v = await exec(node.right, scope);

                    if (ref.kind === 'id') {
                        setVariable(scope, ref.name, v);
                    } else if (ref.kind === 'mem') {
                        ref.obj[ref.prop] = v;
                    } else {
                        // Aqui resolve AssignmentPattern, ArrayPattern e ObjectPattern
                        await assignPattern(ref.pattern, v, scope);
                    }
                    return v;
                }

                // 3. Atribuições compostas (+=, -=, etc.) - Não suportam patterns no lado esquerdo
                let curr = ref.kind === 'id' ? scope[ref.name] : ref.obj[ref.prop];
                let rhs = await exec(node.right, scope);
                let v;

                switch (op) {
                    case '+=': v = curr + rhs; break;
                    case '-=': v = curr - rhs; break;
                    case '*=': v = curr * rhs; break;
                    case '/=': v = curr / rhs; break;
                    case '%=': v = curr % rhs; break;
                    case '**=': v = curr ** rhs; break;
                    case '&&=': v = curr && (curr = await exec(node.right, scope)); break;
                    case '||=': v = curr || (curr = await exec(node.right, scope)); break;
                    case '??=': v = curr ?? (curr = await exec(node.right, scope)); break;
                    default: throw new Error(`Operador não suportado: ${op}`);
                }

                if (ref.kind === 'id') { setVariable(scope, ref.name, v); }
                else { ref.obj[ref.prop] = v; }
                return v;
            }

            case 'BreakStatement': {
                throw { '__break': true, };
            }

            case 'ContinueStatement': {
                throw { '__continue': true, };
            }

            case 'ConditionalExpression': {
                let test = await exec(node.test, scope);
                return test ? await exec(node.consequent, scope) : await exec(node.alternate, scope);
            }

            case 'FunctionExpression': {
                return async function (...argsValues) {
                    let fnScope = Object.create(scope);

                    // CORREÇÃO: Loop com assignPattern para suportar default values
                    for (let [i, param,] of node.params.entries()) {
                        if (param.type === 'RestElement') {
                            await assignPattern(param.argument, argsValues.slice(i), fnScope);
                        } else {
                            await assignPattern(param, argsValues[i], fnScope);
                        }
                    }

                    try {
                        return await exec(node.body, fnScope);
                    } catch (e) {
                        if (e.__return) { return e.value; }
                        throw e;
                    }
                };
            }

            case 'ArrayExpression': {
                let result = [];
                for (let element of node.elements) {
                    if (element.type === 'SpreadElement') {
                        let spreadValue = await exec(element.argument, scope);
                        if (!isIterable(spreadValue)) {
                            throw new TypeError('SpreadElement in array deve essere iterabile');
                        }
                        result.push(...spreadValue);
                    } else {
                        result.push(await exec(element, scope));
                    }
                }
                Object.setPrototypeOf(result, Array.prototype);
                return result;
            }

            case 'ArrowFunctionExpression': {
                return async (...argsValues) => {
                    let fnScope = Object.create(scope);
                    fnScope.this = scope.this;

                    // CORREÇÃO: Loop com entries e assignPattern
                    for (let [i, param,] of node.params.entries()) {
                        if (param.type === 'RestElement') {
                            await assignPattern(param.argument, argsValues.slice(i), fnScope);
                        } else {
                            await assignPattern(param, argsValues[i], fnScope);
                        }
                    }

                    try {
                        let result = await exec(node.body, fnScope);
                        // Se não for um bloco { }, a própria expressão é o retorno
                        if (node.body.type !== 'BlockStatement') { return result; }
                        return result;
                    } catch (e) {
                        if (e && e.__return) { return e.value; }
                        throw e;
                    }
                };
            }

            case 'ForStatement': {
                await exec(node.init, scope);
                while (await exec(node.test, scope)) {
                    try {
                        await exec(node.body, scope);
                    } catch (e) {
                        if (e.__break) { break; }
                        if (e.__continue) { /* Apenas cai aqui para executar o update abaixo */ }
                        else { throw e; }
                    }
                    await exec(node.update, scope);
                }
                return;
            }

            case 'ForOfStatement': {
                let right = await exec(node.right, scope);

                if (right === null || typeof right[Symbol.iterator] !== 'function') {
                    throw new TypeError(`L'oggetto nel for...of non è iterabile`);
                }

                let iterator = right[Symbol.iterator]();

                for (let value of iterator) {
                    let innerScope = Object.create(scope);

                    if (node.left.type === 'VariableDeclaration') {
                        // Usa assignPattern para suportar [index, aba] ou {id, url}
                        let decl = node.left.declarations[0];
                        await assignPattern(decl.id, value, innerScope);
                    } else {
                        // Suporta atribuição direta em variáveis existentes
                        await assignPattern(node.left, value, innerScope);
                    }

                    try {
                        await exec(node.body, innerScope);
                    } catch (e) {
                        if (e.__break) { break; }
                        if (e.__continue) { continue; }
                        throw e;
                    }
                }
                return;
            }

            case 'ForInStatement': {
                let right = await exec(node.right, scope);
                for (let key in right) {
                    let innerScope = Object.create(scope);
                    if (node.left.type === 'VariableDeclaration') {
                        await assignPattern(node.left.declarations[0].id, key, innerScope);
                    } else {
                        await assignPattern(node.left, key, innerScope);
                    }
                    try {
                        await exec(node.body, innerScope);
                    } catch (e) {
                        if (e.__break) { break; }
                        if (e.__continue) { continue; }
                        throw e;
                    }
                }
                return;
            }

            case 'SwitchStatement': {
                let discriminant = await exec(node.discriminant, scope);
                let matched = false;
                for (let caseNode of node.cases) {
                    if (!matched && caseNode.test !== null) {
                        let testValue = await exec(caseNode.test, scope);
                        if (discriminant === testValue) { matched = true; }
                    } else if (caseNode.test === null) {
                        matched = true; // default case
                    }

                    if (matched) {
                        try {
                            for (let stmt of caseNode.consequent) {
                                await exec(stmt, scope);
                            }
                        } catch (e) {
                            if (e.__break) { return; } // Encontrou um 'break', sai do switch
                            throw e;
                        }
                    }
                }
                return;
            }

            case 'ThrowStatement': {
                throw await exec(node.argument, scope);
            }

            case 'ObjectExpression': {
                let obj = {};
                for (let prop of node.properties) {
                    if (prop.type === 'SpreadElement') {
                        let spreadValue = await exec(prop.argument, scope);
                        if (typeof spreadValue !== 'object' || spreadValue === null) {
                            throw new TypeError('SpreadElement in object deve essere un oggetto');
                        }
                        Object.assign(obj, spreadValue);
                    } else if (prop.type === 'Property') {
                        let key = prop.key.type === 'Identifier'
                            ? prop.key.name
                            : await exec(prop.key, scope);
                        let value = await exec(prop.value, scope);
                        obj[key] = value;
                    } else {
                        throw new Error(`Unsupported object property type: ${prop.type}`);
                    }
                }
                return obj;
            }

            case 'WhileStatement':
                while (await exec(node.test, scope)) {
                    try {
                        await exec(node.body, scope);
                    } catch (e) {
                        if (e.__break) { break; }
                        throw e;
                    }
                }
                return;

            case 'FunctionDeclaration': {
                scope[node.id.name] = async function (...argsValues) {
                    let fnScope = Object.create(scope);

                    for (let [i, param,] of node.params.entries()) {
                        if (param.type === 'RestElement') {
                            await assignPattern(param.argument, argsValues.slice(i), fnScope);
                        } else {
                            await assignPattern(param, argsValues[i], fnScope);
                        }
                    }

                    try {
                        return await exec(node.body, fnScope);
                    } catch (e) {
                        if (e.__return) { return e.value; }
                        throw e;
                    }
                };
                return;
            }

            default:
                throw new Error(`Unsupported AST node type: ${node.type}`);
        }
    }

    try {

        await exec(ast, { ...baseScope, });

    } catch (e) {

        if (e.__return) {
            console.log('Returned:', e.value);
        } else {
            console.error('Error:', e);
        }

    }
}


