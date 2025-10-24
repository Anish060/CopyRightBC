// registeredWorksController.js

const registeredWorksModel = require('../model/user_info.js');

/**
 * @desc Register a new work by adding it to the database.
 * @route POST /api/works/register
 * @access Private (Requires Wallet/Auth)
 */
const registerWork = async (req, res) => {
    // Destructure necessary data from the request body
    const { title, type, creator, wallet_id, ipfs_hash, status } = req.body;

    // Simple validation to ensure required fields are present
    if (!title || !type || !creator || !wallet_id || !ipfs_hash) {
        return res.status(400).json({ 
            message: 'Missing required fields: title, type, creator, wallet_id, or ipfs_hash.' 
        });
    }

    try {
        const workData = { title, type, creator, wallet_id, ipfs_hash, status };
        
        // Call the model function to insert the data
        const result = await registeredWorksModel.addRegisteredWork(workData);

        // Respond with success and the insert ID
        res.status(201).json({ 
            message: 'Work successfully registered!',
            registration_id: result.insertId,
            details: workData 
        });
    } catch (error) {
        console.error('Error registering work:', error);
        res.status(500).json({ 
            message: 'Failed to register work due to a server error.', 
            error: error.message 
        });
    }
};


const getAllWorks = async (req, res) => {
    try {
        const works = await registeredWorksModel.getAllRegisteredWorks();

        if (!works || works.length === 0) {
            return res.status(200).json({ message: 'No registered works found.', data: [] });
        }

        res.status(200).json({ 
            count: works.length,
            data: works 
        });
    } catch (error) {
        console.error('Error fetching all registered works:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve all registered works.', 
            error: error.message 
        });
    }
};


const getWorksByWallet = async (req, res) => {
    // Get the walletId from the URL parameters
    const walletId = req.params.walletId;

    if (!walletId) {
        return res.status(400).json({ message: 'Wallet ID parameter is missing.' });
    }

    try {
        // Call the model function to fetch records by walletId
        const works = await registeredWorksModel.getWorksByWalletId(walletId);

        if (works.length === 0) {
            return res.status(200).json({ 
                message: `No registered works found for wallet ID: ${walletId}.`, 
                data: [] 
            });
        }

        res.status(200).json({ 
            wallet_id: walletId,
            count: works.length,
            data: works 
        });
    } catch (error) {
        console.error(`Error fetching works for wallet ${walletId}:`, error);
        res.status(500).json({ 
            message: 'Failed to retrieve works by wallet ID.', 
            error: error.message 
        });
    }
};


module.exports = {
    registerWork,
    getAllWorks,
    getWorksByWallet
};