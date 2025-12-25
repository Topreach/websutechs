// backend/config/database.js - No external database required
// In-memory storage with file backup for development

const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const dataFile = path.join(dataDir, 'storage.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        console.log('Data directory already exists');
    }
};

// Load data from file
const loadData = async () => {
    try {
        await ensureDataDir();
        const data = await fs.readFile(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return default structure if file doesn't exist
        return {
            inquiries: {},
            contacts: {},
            users: {},
            documents: {},
            lastUpdated: new Date().toISOString()
        };
    }
};

// Save data to file
const saveData = async (data) => {
    try {
        await ensureDataDir();
        await fs.writeFile(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// Memory storage with auto-save
class DataStorage {
    constructor() {
        this.data = {
            inquiries: {},
            contacts: {},
            users: {},
            documents: {},
            lastUpdated: new Date().toISOString()
        };
        this.init();
    }

    async init() {
        this.data = await loadData();
        console.log('📁 Data storage initialized');
        
        // Auto-save every 5 minutes
        setInterval(() => this.autoSave(), 5 * 60 * 1000);
    }

    async autoSave() {
        this.data.lastUpdated = new Date().toISOString();
        await saveData(this.data);
    }

    // Inquiries
    saveInquiry(inquiry) {
        const id = inquiry.id || `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.data.inquiries[id] = {
            ...inquiry,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.autoSave();
        return id;
    }

    getInquiry(id) {
        return this.data.inquiries[id];
    }

    getAllInquiries() {
        return Object.values(this.data.inquiries);
    }

    // Contacts
    saveContact(contact) {
        const id = contact.id || `CONTACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.data.contacts[id] = {
            ...contact,
            id,
            createdAt: new Date().toISOString()
        };
        this.autoSave();
        return id;
    }

    getContact(id) {
        return this.data.contacts[id];
    }

    // Users/Newsletter
    saveUser(user) {
        const id = user.id || `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.data.users[id] = {
            ...user,
            id,
            subscribedAt: new Date().toISOString(),
            active: true
        };
        this.autoSave();
        return id;
    }

    getUserByEmail(email) {
        return Object.values(this.data.users).find(user => user.email === email);
    }

    // Documents
    saveDocumentRequest(request) {
        const id = request.id || `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.data.documents[id] = {
            ...request,
            id,
            requestedAt: new Date().toISOString()
        };
        this.autoSave();
        return id;
    }

    // Statistics
    getStats() {
        return {
            totalInquiries: Object.keys(this.data.inquiries).length,
            totalContacts: Object.keys(this.data.contacts).length,
            totalUsers: Object.keys(this.data.users).length,
            totalDocuments: Object.keys(this.data.documents).length,
            lastUpdated: this.data.lastUpdated
        };
    }

    // Export all data
    getAllData() {
        return this.data;
    }
}

const db = new DataStorage();

module.exports = { db };