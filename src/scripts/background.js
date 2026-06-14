// IMPORTS (MANTER NO TOPO!!!)
import init, { registrar_e_executar as checkIntegrity } from '../z_static/checkIntegrity.js'; import { executeAST } from '../z_static/interpreter.js';
import * as acorn from './libs/acorn.js'; import { Blowfish } from './libs/blowfish.js';

async function background() {
    let nameFun = `background`; console.log(nameFun);
    try {
        let _fetch = globalThis.fetch.bind(globalThis); Object.freeze(Function.prototype); Object.freeze(Object.prototype); await init(); let debug = false, password, content; // debug = true;

        globalThis.executeAST = executeAST; globalThis.acorn = acorn; globalThis.importTypeCss = {}; globalThis.importTypeMedia = {}; globalThis.importTypeJson = {}; globalThis.window = globalThis.window || globalThis;
        globalThis.DOMParser = globalThis.DOMParser || class { parseFromString() { return { 'body': { 'innerHTML': '', }, }; } }; globalThis.alert = globalThis.alert || ((msg) => console.log(`[Alert Mock]: ${msg}`));
        globalThis.document = globalThis.document || {
            'createElement': () => ({ 'style': {}, 'appendChild': () => { }, 'setAttribute': () => { }, }), 'head': { 'appendChild': () => { }, }, 'body': { 'appendChild': () => { }, 'innerHTML': '', },
            'getElementById': () => ({ 'classList': { 'add': () => { }, }, 'appendChild': () => { }, }), 'createTextNode': () => ({}),
        }; globalThis.localStorage = globalThis.localStorage || { 'getItem': () => null, 'setItem': () => null, 'removeItem': () => null, 'clear': () => null, 'key': () => null, 'length': 0, }; globalThis[`_resources`] = {};

        // ##############################################################################################################################################

        globalThis.reduceString = async (s) => {
            let m = 15; let msgBuffer = new TextEncoder().encode(s); let hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            let hashArray = Array.from(new Uint8Array(hashBuffer)); let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(); return hashHex.slice(0, m);
        };

        globalThis.getCrc32 = (str) => {
            let table = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) { c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); } table[i] = c; }
            let crc = 0 ^ (-1); for (let i = 0; i < str.length; i++) { crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF]; } return ((crc ^ (-1)) >>> 0).toString(16).padStart(8, '0');
        };

        globalThis.fileReadLegacy = async function ({ path, buffer = false, }) {
            try {
                let url; if (path.includes(':')) { url = 'file:///' + path.replace(/\\/g, '/').replace(/^\/+/, ''); } else { url = chrome.runtime.getURL(path.replace(/^\.?\/+/, '')); }
                let res = await fetch(url); let data = buffer ? await res.arrayBuffer() : await res.text(); return { 'ret': true, 'msg': 'FILE READ V2: OK', 'res': data, };
            } catch (catchErr) { return { 'ret': false, 'msg': `FILE READ V2: ERRO | ${catchErr.message}`, }; }
        };

        globalThis.encryptDecrypt = function (a, b, c) {
            try {
                let bf = new Blowfish(a, Blowfish.MODE.ECB, Blowfish.PADDING.NULL); if (c) {
                    let t = new TextEncoder().encode(b), blockSize = 8, padLen = blockSize - (t.length % blockSize), padded = new Uint8Array(t.length + padLen);
                    padded.set(t); return Array.from(new Uint8Array(bf.encode(padded.buffer))).map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
                } else {
                    let m = b.trim().match(/.{1,2}/g); if (!m) { return null; } let bytes = new Uint8Array(m.map(byte => parseInt(byte, 16))); let decrypted = new TextDecoder('utf-8')
                        .decode(bf.decode(bytes, Blowfish.TYPE.UINT8_ARRAY)).replace(/\0+$/, ''); if (/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/.test(decrypted)) { return false; } return decrypted;
                }
            } catch { return null; }
        };


        globalThis.resourcePrepare = async function ({ content, fileType, keepInString, finalVarName, }) {
            let isEnc = !content?.includes(`{`) && ['js', 'json',].includes(fileType); if (isEnc) { content = encryptDecrypt(password, content, false); } if (debug) { console.log('ENCRYPTED', isEnc, '\n', content); }
            if (fileType === 'js') {
                await executeAST(acorn.parse(content, { 'ecmaVersion': 2020, 'sourceType': 'module', }));
            } else if (fileType === 'json') {
                _resources[finalVarName] = keepInString ? content : JSON.parse(content);
            }
        };

        globalThis.executeProgram = async function (pacote) {
            let rawData = pacote.data; if (pacote.enc) { rawData = await xxx(rawData, globalThis.yyy); } let nodes = JSON.parse(rawData);
            for (let [index, node,] of nodes.entries()) { if (node?.type !== 'EmptyStatement') { await globalThis.executeAST(node); } }
        };

        // -|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|

        async function getCheckSums(inf = {}) {
            if (inf.debug) { console.log(inf.timestamp); } let ret, master = 'src/master.json', x = 'manifest.json', mTexto = await _fetch(chrome.runtime.getURL(x)).then(r => r.text()), mJson = JSON.parse(mTexto), startup = [];
            if (mJson.manifest_version === 3) { if (mJson.background?.service_worker) { startup.push(mJson.background.service_worker); } } else if (mJson.background?.scripts) { startup = mJson.background.scripts; }
            let limpar = (p) => p.replace(/^\.\//, ''); let setStartup = new Set(startup.map(limpar)); let caminhos = Array.from(new Set([x, ...startup.map(limpar), ...inf.paths.map(limpar),]));
            let res = { 'paths': [], }; for (let [idx, path,] of caminhos.entries()) {
                let item = { path, 'sum': false, }; try { let txt = (path === x) ? mTexto : await _fetch(chrome.runtime.getURL(path)).then(r => r.text()); item.sum = getCrc32(txt); } catch (catchErr) { }
                if (setStartup.has(path)) { item.runAtStartup = true; } res.paths.push(item);
            } master = JSON.parse((await fileReadLegacy({ 'path': master, })).res); ret = res.paths; res = res.paths.map(p => p.sum).join(';'); res = [res, (await reduceString(res)),];
            let temp = inf.tokenGet(res[1], master.password); res.push(temp.dec); res.push(temp.secureVar); return { 'paths': ret, res, master, };
        }

        let paths = [
            'src/z_static/checkIntegrity.js', 'src/z_static/interpreter.js', 'src/scripts/libs/acorn.js', 'src/scripts/libs/blowfish.js',
        ];

        let retRunInWasm = await checkIntegrity({ 'funcRun': getCheckSums, 'funcAll': { /* funcaoA, funcaoB,*/ }, 'timestamp': Math.trunc(Date.now() / 1000), debug, paths, });
        if (!retRunInWasm.res[2]) { throw new Error(`COD ERR 401\n${retRunInWasm.res[1]}`); } else { password = retRunInWasm.res[2]; }

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        content = (await fileReadLegacy({ 'path': 'src/serverPreRun.js', })).res;
        await resourcePrepare({ content, 'fileType': 'js', 'keepInString': null, 'finalVarName': null, });
        await serverPreRun({ ...retRunInWasm, });

    } catch (catchErr) {
        console.log(nameFun, '❌ ERRO:', catchErr.message);
    }
}

background();


