/* @ts-self-types="./checkIntegrity.d.ts" */

/**
 * @param {any} obj_recebido
 * @returns {Promise<any>}
 */
export function registrar_e_executar(obj_recebido) {
    let ret = wasm.registrar_e_executar(obj_recebido);
    return ret;
}

function __wbg_get_imports() {
    let import0 = {
        '__proto__': null,
        '__wbg___wbindgen_is_falsy_c6ddfae1bb56d5ef'(arg0) {
            let ret = !arg0;
            return ret;
        },
        '__wbg___wbindgen_is_function_49868bde5eb1e745'(arg0) {
            let ret = typeof (arg0) === 'function';
            return ret;
        },
        '__wbg___wbindgen_is_null_344c8750a8525473'(arg0) {
            let ret = arg0 === null;
            return ret;
        },
        '__wbg___wbindgen_is_object_40c5a80572e8f9d3'(arg0) {
            let val = arg0;
            let ret = typeof (val) === 'object' && val !== null;
            return ret;
        },
        '__wbg___wbindgen_is_undefined_c0cca72b82b86f4d'(arg0) {
            let ret = arg0 === undefined;
            return ret;
        },
        '__wbg___wbindgen_string_get_914df97fcfa788f2'(arg0, arg1) {
            let obj = arg1;
            let ret = typeof (obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        '__wbg___wbindgen_throw_81fc77679af83bc6'(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        '__wbg__wbg_cb_unref_3c3b4f651835fbcb'(arg0) {
            arg0._wbg_cb_unref();
        },
        '__wbg_call_d578befcc3145dee'() {
            return handleError(function (arg0, arg1, arg2) {
                let ret = arg0.call(arg1, arg2);
                return ret;
            }, arguments);
        },
        '__wbg_deleteProperty_f6d6e6660f3fd8ef'() {
            return handleError(function (arg0, arg1) {
                let ret = Reflect.deleteProperty(arg0, arg1);
                return ret;
            }, arguments);
        },
        '__wbg_get_4848e350b40afc16'(arg0, arg1) {
            let ret = arg0[arg1 >>> 0];
            return ret;
        },
        '__wbg_get_f96702c6245e4ef9'() {
            return handleError(function (arg0, arg1) {
                let ret = Reflect.get(arg0, arg1);
                return ret;
            }, arguments);
        },
        '__wbg_instanceof_Promise_95d523058012a13d'(arg0) {
            let result;
            try {
                result = arg0 instanceof Promise;
            } catch (_) {
                result = false;
            }
            let ret = result;
            return ret;
        },
        '__wbg_keys_e611eeb7873788db'(arg0) {
            let ret = Object.keys(arg0);
            return ret;
        },
        '__wbg_length_6e821edde497a532'(arg0) {
            let ret = arg0.length;
            return ret;
        },
        '__wbg_new_4f9fafbb3909af72'() {
            let ret = new Object();
            return ret;
        },
        '__wbg_new_typed_14d7cc391ce53d2c'(arg0, arg1) {
            try {
                var state0 = { 'a': arg0, 'b': arg1, };
                var cb0 = (arg0, arg1) => {
                    let a = state0.a;
                    state0.a = 0;
                    try {
                        return wasm_bindgen__convert__closures_____invoke__h047b7e952d0d80ca(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                let ret = new Promise(cb0);
                return ret;
            } finally {
                state0.a = 0;
            }
        },
        '__wbg_queueMicrotask_abaf92f0bd4e80a4'(arg0) {
            let ret = arg0.queueMicrotask;
            return ret;
        },
        '__wbg_queueMicrotask_df5a6dac26d818f3'(arg0) {
            queueMicrotask(arg0);
        },
        '__wbg_resolve_0a79de24e9d2267b'(arg0) {
            let ret = Promise.resolve(arg0);
            return ret;
        },
        '__wbg_set_8ee2d34facb8466e'() {
            return handleError(function (arg0, arg1, arg2) {
                let ret = Reflect.set(arg0, arg1, arg2);
                return ret;
            }, arguments);
        },
        '__wbg_static_accessor_GLOBAL_THIS_a1248013d790bf5f'() {
            let ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        '__wbg_static_accessor_GLOBAL_f2e0f995a21329ff'() {
            let ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        '__wbg_static_accessor_SELF_24f78b6d23f286ea'() {
            let ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        '__wbg_static_accessor_WINDOW_59fd959c540fe405'() {
            let ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
        },
        '__wbg_then_00eed3ac0b8e82cb'(arg0, arg1, arg2) {
            let ret = arg0.then(arg1, arg2);
            return ret;
        },
        '__wbg_then_a0c8db0381c8994c'(arg0, arg1) {
            let ret = arg0.then(arg1);
            return ret;
        },
        '__wbg_toString_6101fa04779cd0ac'(arg0) {
            let ret = arg0.toString();
            return ret;
        },
        '__wbindgen_cast_0000000000000001'(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [Externref], shim_idx: 29, ret: Result(Unit), inner_ret: Some(Result(Unit)) }, mutable: true }) -> Externref`.
            let ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h6cec8b11b936d192);
            return ret;
        },
        '__wbindgen_cast_0000000000000002'(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [String, String, Boolean], shim_idx: 7, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            let ret = makeClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h627cefbed239bbfc);
            return ret;
        },
        '__wbindgen_cast_0000000000000003'(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { owned: true, function: Function { arguments: [String, String], shim_idx: 5, ret: Externref, inner_ret: Some(Externref) }, mutable: false }) -> Externref`.
            let ret = makeClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h5db77575dd27c31b);
            return ret;
        },
        '__wbindgen_cast_0000000000000004'(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            let ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        '__wbindgen_init_externref_table'() {
            let table = wasm.__wbindgen_externrefs;
            let offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        '__proto__': null,
        './checkIntegrity_bg.js': import0,
    };
}

function wasm_bindgen__convert__closures_____invoke__h6cec8b11b936d192(arg0, arg1, arg2) {
    let ret = wasm.wasm_bindgen__convert__closures_____invoke__h6cec8b11b936d192(arg0, arg1, arg2);
    if (ret[1]) {
        throw takeFromExternrefTable0(ret[0]);
    }
}

function wasm_bindgen__convert__closures_____invoke__h047b7e952d0d80ca(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__h047b7e952d0d80ca(arg0, arg1, arg2, arg3);
}

function wasm_bindgen__convert__closures_____invoke__h5db77575dd27c31b(arg0, arg1, arg2, arg3) {
    let ptr0 = passStringToWasm0(arg2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    let len0 = WASM_VECTOR_LEN;
    let ptr1 = passStringToWasm0(arg3, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    let len1 = WASM_VECTOR_LEN;
    let ret = wasm.wasm_bindgen__convert__closures_____invoke__h5db77575dd27c31b(arg0, arg1, ptr0, len0, ptr1, len1);
    return ret;
}

function wasm_bindgen__convert__closures_____invoke__h627cefbed239bbfc(arg0, arg1, arg2, arg3, arg4) {
    let ptr0 = passStringToWasm0(arg2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    let len0 = WASM_VECTOR_LEN;
    let ptr1 = passStringToWasm0(arg3, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    let len1 = WASM_VECTOR_LEN;
    let ret = wasm.wasm_bindgen__convert__closures_____invoke__h627cefbed239bbfc(arg0, arg1, ptr0, len0, ptr1, len1, arg4);
    return ret;
}

function addToExternrefTable0(obj) {
    let idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

let CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { 'register': () => { }, 'unregister': () => { }, }
    : new FinalizationRegistry(state => wasm.__wbindgen_destroy_closure(state.a, state.b));

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeClosure(arg0, arg1, f) {
    let state = { 'a': arg0, 'b': arg1, 'cnt': 1, };
    let real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeMutClosure(arg0, arg1, f) {
    let state = { 'a': arg0, 'b': arg1, 'cnt': 1, };
    let real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        let a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            wasm.__wbindgen_destroy_closure(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        let buf = cachedTextEncoder.encode(arg);
        let ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    let mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        let code = arg.charCodeAt(offset);
        if (code > 0x7F) { break; }
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        let view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        let ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    let value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { 'ignoreBOM': true, 'fatal': true, });
cachedTextDecoder.decode();
let MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { 'ignoreBOM': true, 'fatal': true, });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        let buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            'read': arg.length,
            'written': buf.length,
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                let validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn('`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n', e);

                } else { throw e; }
            }
        }

        let bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        let instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module, };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) { return wasm; }


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({ module, } = module);
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
        }
    }

    let imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    let instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) { return wasm; }


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({ module_or_path, } = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('checkIntegrity_bg.wasm', import.meta.url);
    }
    let imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    let { instance, module, } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
