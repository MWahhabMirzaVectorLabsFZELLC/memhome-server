const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const Token = require('./models/Token');
const TokenPrice = require('./models/Price');
const Transaction = require('./models/Transaction');
const cloudinary = require('./config/cloudinary'); // Import Cloudinary config

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure multer for file handling
const upload = multer(); // Using multer for handling file uploads

// Sync database
sequelize.sync()
    .then(() => console.log('MySQL Database connected and models synced'))
    .catch(err => console.error('Database connection error:', err));

// Route to upload token details and image
app.post('/api/tokens', upload.single('file'), async (req, res) => {
    try {
        const { name, symbol, twitter, telegram, website, tokenAddress } = req.body;

        let imageUrl = null;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({
                    folder: 'tokens',
                    transformation: [{ width: 500, height: 500, crop: 'limit' }]
                }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }).end(req.file.buffer); // Ensure file buffer is ended
            });

            imageUrl = result.secure_url;
        }

        const newToken = await Token.create({
            tokenAddress,
            name,
            symbol,
            twitter,
            telegram,
            website,
            imageUrl
        });

        res.status(201).json({ message: 'Token details saved successfully', data: newToken });
    } catch (error) {
        console.error('Error saving token details:', error);
        res.status(500).json({ message: 'Error saving token details', error: error.message });
    }
});

// Route to store token price
app.post('/api/price', async (req, res) => {
    try {
        const { tokenAddress, price } = req.body;

        if (!tokenAddress || price == null) {
            return res.status(400).send('Token address and price are required');
        }

        await TokenPrice.create({ tokenAddress, price });

        res.status(201).send('Token price stored successfully');
    } catch (error) {
        console.error('Error storing token price:', error);
        res.status(500).send('Server error');
    }
});

// Route to get all tokens
app.get('/api/tokens', async (req, res) => {
    try {
        const tokens = await Token.findAll();
        res.status(200).json({ message: 'Tokens retrieved successfully', data: tokens });
    } catch (error) {
        console.error('Error retrieving tokens:', error);
        res.status(500).json({ message: 'Error retrieving tokens', error: error.message });
    }
});

// Route to get a specific token by address
app.get('/api/tokens/address/:tokenAddress', async (req, res) => {
    const { tokenAddress } = req.params;
    try {
        const token = await Token.findOne({ where: { tokenAddress } });
        if (token) {
            res.status(200).json({ message: 'Token retrieved successfully', data: token });
        } else {
            res.status(404).json({ message: 'Token not found' });
        }
    } catch (error) {
        console.error('Error retrieving token:', error);
        res.status(500).json({ message: 'Error retrieving token', error: error.message });
    }
});

// Route to get price history by token address
app.get('/api/price/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;

        const prices = await TokenPrice.findAll({
            where: { tokenAddress },
            order: [['createdAt', 'ASC']]
        });

        if (prices.length === 0) {
            return res.status(404).send('No prices found for the given token address');
        }

        res.status(200).json(prices);
    } catch (error) {
        console.error('Error fetching token price history:', error);
        res.status(500).send('Server error');
    }
});

// Route to store transaction details
app.post('/api/transactions', async (req, res) => {
    const {type,
		tknName,
		tokenQuantity,
		ethQuantity,
		txHash,
		userAddress,
		timestamp,} = req.body;

    if (!tknName || !tokenQuantity || !type || !txHash || !userAddress || !timestamp) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Additional logging for debugging
        console.log('Received transaction data:', { tknName, tokenQuantity, type, ethQuantity, txHash, userAddress, timestamp });

        const newTransaction = await Transaction.create({
            tknName,
            tokenQuantity,
            type,
            ethQuantity,
            userAddress,
            txHash,
            timestamp
        });

        console.log('Transaction stored successfully:', newTransaction);
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error('Error storing transaction:', error);
        res.status(500).json({ error: 'Failed to store transaction', error: error.message });
    }
});


// Route to fetch transactions by token name
app.get('/api/transactions', async (req, res) => {
    const { tokenName } = req.query;

    if (!tokenName) {
        return res.status(400).json({ message: 'Token name is required' });
    }

    try {
        const transactions = await Transaction.findAll({ where: { tknName: tokenName } });

        if (transactions.length === 0) {
            return res.status(404).json({ message: `No transactions found for '${tokenName}'` });
        }

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
