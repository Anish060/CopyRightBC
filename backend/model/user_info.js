// registeredWorksModel.js (ES Module)

// Import the database connection using ESM syntax
import db from '../config/database.js'; 


/**
 * Inserts a new registered work record into the database.
 * @param {object} data - Object containing all work fields.
 */
export const addRegisteredWork = async (data) => {
    // SQL command to insert data into the registered_works table
    const sql = `
        INSERT INTO registered_works (
            title, 
            type, 
            creator, 
            wallet_id, 
            ipfs_hash, 
            status 
        ) VALUES (?, ?, ?, ?, ?, ?);
    `;

    // Values array mapping directly to the placeholders in the SQL query
    const values = [
        data.title, 
        data.type, 
        data.creator, 
        data.wallet_id, 
        data.ipfs_hash, 
        data.status || 'Registered' // Use 'Registered' if status is not provided
    ];

    try {
        // Use await with the Promise-based query
        const [result] = await db.query(sql, values);
        return result;
    } catch (err) {
        console.error('Database error in addRegisteredWork:', err);
        throw err;
    }
};


/**
 * Retrieves all registered works from the database (potentially for admin use).
 */
export const getAllRegisteredWorks = async () => {
    try {
        // mysql2/promise returns [rows, fields] array
        const [rows] = await db.query("SELECT * FROM registered_works ORDER BY registration_date DESC");
        
        // Return rows directly with database keys (snake_case)
        return rows; 
    } catch (err) {
        console.error('Database error in getAllRegisteredWorks:', err);
        throw err; 
    }
};


/**
 * Retrieves all registered works associated with a specific wallet ID.
 * @param {string} walletId - The ID of the wallet whose records to fetch.
 */
export const getWorksByWalletId = async (walletId) => {
    try {
        // mysql2/promise returns [rows, fields] array
        const [rows] = await db.query(
            "SELECT * FROM registered_works WHERE wallet_id = ? ORDER BY registration_date DESC",
            [walletId]
        );

        if (rows.length === 0) {
            // Return an empty array if no records are found for the wallet ID.
            return []; 
        }

        // Return rows directly with database keys (snake_case)
        return rows; 
    } catch (err) {
        console.error(`Database error in getWorksByWalletId(${walletId}):`, err); 
        throw err; 
    }
};

// Exporting the functions using named exports (ESM)
// Note: If you prefer a single default export object, you would use:
/* export default {
    addRegisteredWork,
    getAllRegisteredWorks,
    getWorksByWalletId
}; 
*/