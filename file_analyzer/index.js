const { parse } = require('@babel/parser');
const generator = require('@babel/generator').default;

const { normalizeStringLiterals } = require('./normalizeStringLiterals.js');
const { debfuscateRC4Encryption } = require('./deobfuscateRC4.js');

function extractEncryptionKeys(code) {
    const ast = parse(code);
    normalizeStringLiterals(ast);
    debfuscateRC4Encryption(ast);
    const fileContent = generator(ast).code;
    const regex = /var\s+([a-zA-Z0-9_$]+)\s*=\s*"([^"]+)";/g;
    const variables = {};
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
        const variableName = match[1];
        const variableValue = match[2];
        variables[variableName] = variableValue;
    }
    const nameCounts = {};
    for (const name in variables) {
        const regexName = new RegExp(`\\b${name}\\b`, 'g');
        nameCounts[name] = (fileContent.match(regexName) || []).length;
    }
    const filteredVariables = {};
    for (const name in variables) {
        if (nameCounts[name] === 4) {
            filteredVariables[name] = variables[name];
        }
    }
    const thirdKey = Object.keys(filteredVariables)[2];
    return filteredVariables[thirdKey]; 
}

module.exports = extractEncryptionKeys