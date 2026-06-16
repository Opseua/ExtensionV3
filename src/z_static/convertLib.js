let isChrome = typeof chrome !== 'undefined';

async function convertLib({ path, content, } = {}) {
    let code = content;

    function clearCode(code) {
        // remove imports
        code = code.replace(/^import\s[\s\S]+?;$/gm, '');
        // remove blocos export { ... }
        code = code.replace(/export\s*\{[^}]*\}/g, '');
        // remove export inline (export function, export const, etc)
        code = code.replace(/\bexport\s+(default\s+)?/g, '');
        // remove export * from
        code = code.replace(/export\s*\*\s*(as\s+\w+\s*)?from\s+['"][^'"]+['"]\s*;?/g, '');
        // limpa ; soltos e linhas em branco excessivas
        code = code.replace(/^\s*;\s*$/gm, '');
        code = code.replace(/\n{3,}/g, '\n\n');
        return code;
    }

    if (!code) {
        if (isChrome) {
            let result = await globalThis.fileReadLegacy({ path, });
            if (!result.ret) { throw new Error(result.msg); }
            code = result.res;
        } else {
            let fs = await import('fs');
            code = fs.readFileSync(path, 'utf8');
        }
    }

    // coleta todos os nomes exportados, cobrindo todos os formatos:
    // export { a as b }
    // export { a }
    // export { a, b, c }
    // export { a as default }  ← ignorado (default não tem nome utilizável)
    // export default function nome  ← ignorado
    // export function nome / export class nome / export const nome = ...
    let names = new Set();

    // formato: export { ... }
    let blockRegex = /export\s*\{([^}]+)\}/g;
    for (let [, block,] of code.matchAll(blockRegex)) {
        for (let part of block.split(',')) {
            let trimmed = part.trim();
            if (!trimmed) { continue; }

            // "X as Y" → usa Y (nome público)
            let asMatch = trimmed.match(/^(\w+)\s+as\s+(\w+)$/);
            if (asMatch) {
                let [, original, alias,] = asMatch;
                if (alias !== 'default') { names.add({ original, alias, }); }
                continue;
            }

            // "X" simples
            let simple = trimmed.match(/^(\w+)$/);
            if (simple && simple[1] !== 'default') {
                names.add({ 'original': simple[1], 'alias': simple[1], });
            }
        }
    }

    // formato: export function nome / export class nome / export async function nome
    let declRegex = /export\s+(?:async\s+)?(?:function|class)\s+(\w+)/g;
    for (let [, name,] of code.matchAll(declRegex)) {
        names.add({ 'original': name, 'alias': name, });
    }

    // formato: export const/let/var nome = ...
    let varRegex = /export\s+(?:const|let|var)\s+(\w+)/g;
    for (let [, name,] of code.matchAll(varRegex)) {
        names.add({ 'original': name, 'alias': name, });
    }

    // LIMPAR CÓDIGO
    code = clearCode(code);

    if (names.size === 0) { return code; }

    let lines = [
        '',
        '// ---------------------------- EXPORTANDO GLOBALMENTE',
        ...[...names,].map(({ original, alias, }) => `globalThis.${alias} = ${original};`),
        '// ----------------------------\n\n\n',
    ];

    return code + lines.join('\n');
}

globalThis.convertLib = convertLib;
export { convertLib };


