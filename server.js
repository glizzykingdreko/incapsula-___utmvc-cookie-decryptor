const express = require('express');
const bodyParser = require('body-parser');
const decryptCookie = require('./decryptor');

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static('public'));

app.post('/decrypt', async (req, res) => {
    try {
        const { cookie, script } = req.body;
        
        if (!cookie || !script) {
            return res.status(400).json({ error: 'Both cookie and script are required' });
        }

        // Here you'll integrate your existing decryption logic
        // For now, we'll return a mock response
        const result = decryptCookie(cookie, script);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Invalid data provided" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 