const extractEncryptionKeys = require('./file_analyzer/index');

/**
 * Parse browser data from a decrypted cookie string
 * @param {string} inputString - The decrypted cookie string containing browser data
 * @param {Array<string>} attributes - List of browser attributes to extract
 * @returns {Object} Object containing extracted browser data with attributes as keys
 */
function parseBrowserData(inputString, attributes) {
    const result = {};

    attributes.forEach(attr => {
        // Create a regex to capture values, allowing for commas in the value
        const pattern = new RegExp(`${attr.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}=([^,]+(?:, [^,]+)*)(,|$)`);
        const match = inputString.match(pattern);

        if (match) {
            // Store the extracted value in the result
            result[attr] = match[1].trim();
        } else {
            // If not found, set the value as null
            result[attr] = null;
        }
    });

    // Check for the specific scriptID format at the end of the input
    const scriptIdPattern = /'([a-zA-Z0-9]+)'\.toString\(\)=\1$/;
    const scriptIdMatch = inputString.match(scriptIdPattern);

    if (scriptIdMatch) {
        result.scriptID = scriptIdMatch[1]; // The extracted alphanumeric string
        result.scriptIDFormat = "valid";
    } else {
        result.scriptID = null;
        result.scriptIDFormat = "invalid";
    }

    return result;
}

// List of browser attributes to extract from the cookie
// These attributes are collected by the Incapsula script for fingerprinting
const attributesList = [
    "navigator",
    "navigator.vendor",
    "navigator.appName",
    "navigator.plugins.length==0",
    "navigator.platform",
    "navigator.webdriver",
    "plugin_ext",
    "ActiveXObject",
    "webkitURL",
    "_phantom",
    "callPhantom",
    "chrome",
    "yandex",
    "opera",
    "opr",
    "safari",
    "awesomium",
    "puffinDevice",
    "__nightmare",
    "domAutomation",
    "domAutomationController",
    "_Selenium_IDE_Recorder",
    "document.__webdriver_script_fn",
    "document.$cdc_asdjflasutopfhvcZLmcfl_",
    "process.version",
    "global.require",
    "global.process",
    "WebAssembly",
    "require('fs')",
    "globalThis==global",
    "window.toString()",
    "navigator.cpuClass",
    "navigator.oscpu",
    "navigator.connection",
    "navigator.language=='C'",
    "Object.keys(window).length",
    "window.outerWidth==0",
    "window.outerHeight==0",
    "window.WebGLRenderingContext",
    "window.constructor.toString()",
    "Boolean(typeof process !== 'undefined' && process.versions && process.versions.node)",
    "document.documentMode",
    "eval.toString().length",
    "navigator.connection.rtt",
    "deviceType",
    "screen.width",
    "screen.height",
    "eoapi",
    "eoapi_VerifyThis",
    "eoapi_extInvoke",
    "eoWebBrowserDispatcher",
    "window.HIDDEN_CLASS",
    "navigator.mimeTypes.length==2",
    "navigator.plugins.length==2",
    "window.globalThis",
    "navigator.userAgentData.brands[0].brand",
    "navigator.userAgentData.brands[1].brand",
    "navigator.userAgentData.brands[2].brand",
    "navigator.plugins['Microsoft Edge PDF Plugin']",
    "navigator.brave",
    "navigator.userAgentData.mobile",
    "navigator.userAgentData.platform"
];

/**
 * Decrypt an Incapsula ___utmvc cookie using RC4 algorithm
 * @param {string} cookie - Base64 encoded ___utmvc cookie value
 * @param {string} script - Either the full Incapsula script or just the 5-character decryption key
 * @returns {Object|boolean} Object containing decrypted data or false if decryption fails
 * @property {string} raw - Raw decrypted string before URI decoding
 * @property {string} details - URI decoded content of the cookie
 * @property {string} digest - Digest value from the cookie
 * @property {string} s - 's' parameter from the cookie
 * @property {Object} examinated - Parsed browser fingerprinting data
 * @property {string} decryptionKey - The 5-character key used for decryption
 */
function decryptCookie(cookie, script) {
    // Extract or use the provided 5-character key
    let key = script.length > 5 ? extractEncryptionKeys(script)["substr"](0x0, 0x5) : script;
    // Decode base64 cookie and split components
    let decodedString = atob(cookie);
    let data = decodedString.split(",digest=")[0];

    // Initialize RC4 state array
    // 1) RC4 state init
    let s = new Array(256);
    for (let i = 0; i < 256; i++) {
        s[i] = i;
    }

    // Perform RC4 key scheduling algorithm (KSA)
    // 2) Key scheduling
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
        [s[i], s[j]] = [s[j], s[i]];
    }

    // Generate keystream and decrypt data using RC4 PRGA
    // 3) RC4 PRGA (Pseudo-random generation algorithm)
    let result = '';
    let i = 0;
    j = 0;
    for (let y = 0; y < data.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        [s[i], s[j]] = [s[j], s[i]];
        const decryptedCharCode = data.charCodeAt(y) ^ s[(s[i] + s[j]) % 256];
        result += String.fromCharCode(decryptedCharCode);
    }

    // Try to URI decode the result
    let details;
    try {
        details = decodeURIComponent(result);
    } catch (e) {
        return false
    }

    // Return all components of the decrypted cookie
    return {
        raw: result,
        details: details,
        digest: decodedString.split(",digest=")[1].split(",s=")[0],
        s: decodedString.split(",s=")[1],
        examinated: parseBrowserData(details, attributesList),
        decryptionKey: key
    };
}

module.exports = decryptCookie