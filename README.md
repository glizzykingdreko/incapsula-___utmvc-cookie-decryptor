# Incapsula ___utmvc Cookie Analyzer & Decryptor

A web-based tool to analyze and decrypt Incapsula's ___utmvc cookies. Try it out [here](https://glizzykingdreko.github.io/incapsula-___utmvc-cookie-decryptor).

![Preview](preview.gif)

## Table of Contents
- [Incapsula \_\_\_utmvc Cookie Analyzer \& Decryptor](#incapsula-___utmvc-cookie-analyzer--decryptor)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [How It Works](#how-it-works)
  - [Technical Details](#technical-details)
  - [Related Projects](#related-projects)
  - [Usage](#usage)
  - [Local Development](#local-development)
  - [Contributing](#contributing)
  - [Author](#author)

## Overview

The Incapsula ___utmvc cookie is part of an outdated protection mechanism from Incapsula. This protection relied on:
1. A dynamic endpoint serving obfuscated JavaScript
2. Browser fingerprinting and analysis
3. RC4 encryption with a dynamic key
4. Cookie-based authentication for protected endpoints

While this method is now outdated, it's still used by websites that haven't updated their security measures in years.

## Features

- 🔐 Decrypt ___utmvc cookies
- 🔍 Analyze browser fingerprinting data
- 🔑 Extract decryption keys from obfuscated scripts
- 📋 Copy results in formatted JSON
- 🔗 Shareable URLs for easy collaboration
- 🌐 Web-based interface, no installation needed

## How It Works

The protection flow works as follows:

1. Website serves an obfuscated JavaScript file
2. Script collects browser information
3. Data is combined with script-based hashes
4. RC4 encryption is applied using a dynamic key
5. Result is set as the `___utmvc` cookie
6. Cookie is used for subsequent request authentication

## Technical Details

The decryption process involves:

1. **Key Extraction**: Using the `file-analyzer` module (based on my old[Incapsula-utmvc-Deobfuscator](https://github.com/glizzykingdreko/Incapsula-utmvc-Deobfuscator)) to deobfuscate the script and extract the encryption key
2. **RC4 Decryption**: Reversing the RC4 encryption using the extracted key
3. **Data Parsing**: Analyzing the decrypted data to extract browser fingerprinting information

You can find the complete decryption process in the [`decryptor.js`](decryptor.js) file.

## Related Projects

- [Incapsula-utmvc-Deobfuscator](https://github.com/glizzykingdreko/Incapsula-utmvc-Deobfuscator) - Tool to deobfuscate Incapsula's dynamic __utmvc scripts
- [Medium Article](coming-soon) - Detailed explanation of the project development

## Usage

1. Visit the [online tool](https://glizzykingdreko.github.io/incapsula-___utmvc-cookie-decryptor)

The tool is also available on Vercel at [vercel-url]

2. Input your __utmvc cookie
3. Either:
   - Paste the full Incapsula script
   - Or just the 5-character decryption key
4. Click "Analyze" to see the decrypted results

## Local Development

Clone the repository

```bash
git clone https://github.com/glizzykingdreko/incapsula-___utmvc-cookie-decryptor
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm start
```

Open the browser and navigate to `http://localhost:3000` to use the tool.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Author

- [@glizzykingdreko](https://github.com/glizzykingdreko)
- [Medium](https://medium.com/@glizzykingdreko)
- [Twitter](https://twitter.com/glizzykingdreko)