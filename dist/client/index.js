"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryClient = void 0;
// Default retry options
const DEFAULT_RETRY = {
    retries: 3,
    retryDelay: 200,
};
class SchemaRegistryClient {
    constructor({ host, auth, clientId, retry = DEFAULT_RETRY }) {
        this.host = host;
        this.auth = auth;
        this.clientId = clientId;
        this.retry = { ...DEFAULT_RETRY, ...retry };
    }
    // Fetch with retry logic
    async fetchWithRetry(url, options) {
        let attempt = 0;
        while (attempt < this.retry.retries) {
            try {
                const response = await fetch(url, options);
                if (response.ok)
                    return response;
                // Log the response and read the body to get more details
                const errorBody = await response.text(); // Read the response body
                console.log(`Error Response (Attempt ${attempt + 1}):`, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    body: errorBody, // Log the body content for more details
                });
                // Throw an error with the response status and body details
                throw new Error(`HTTP error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            }
            catch (error) {
                if (attempt === this.retry.retries - 1) {
                    throw new Error(`Failed to fetch ${url} after ${this.retry.retries} attempts: ${error.message}`);
                }
            }
            attempt++;
            await new Promise(resolve => setTimeout(resolve, this.retry.retryDelay));
        }
        throw new Error(`Failed to fetch ${url} after ${this.retry.retries} attempts`);
    }
    // Get headers for requests
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.auth) {
            const basicAuth = Buffer.from(`${this.auth.username}:${this.auth.password}`).toString('base64');
            headers['Authorization'] = `Basic ${basicAuth}`;
        }
        if (this.clientId) {
            headers['Client-Id'] = this.clientId;
        }
        return headers;
    }
    // Schema Operations
    async registerSchema(subject, schema) {
        const url = `${this.host}/subjects/${subject}/versions`;
        const options = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                schema: JSON.stringify(schema), // Wrap the schema in an object with a schema key
            }),
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to register schema: ${errorBody}`);
        }
        return response.json();
    }
    async getSchemaById(id) {
        const url = `${this.host}/schemas/ids/${id}`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch schema with ID ${id}: ${errorBody}`);
        }
        return response.json();
    }
    async getSchemaByVersion(subject, version = 'latest') {
        const url = `${this.host}/subjects/${subject}/versions/${version}`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    async getAllVersions(subject) {
        const url = `${this.host}/subjects/${subject}/versions`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    // Subject Operations
    async getAllSubjects() {
        const url = `${this.host}/subjects`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    async deleteSubject(subject) {
        const url = `${this.host}/subjects/${subject}`;
        const options = {
            method: 'DELETE',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to delete subject ${subject}: ${errorBody}`);
        }
    }
    // Compatibility Operations
    async checkCompatibility(subject, version, schema) {
        const url = `${this.host}/compatibility/subjects/${subject}/versions/${version}`;
        const options = {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(schema),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    async getGlobalCompatibility() {
        const url = `${this.host}/config`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    async setGlobalCompatibility(level) {
        const url = `${this.host}/config`;
        const options = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ compatibility: level }),
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to set global compatibility: ${errorBody}`);
        }
    }
    // Mode Operations
    async getMode() {
        const url = `${this.host}/mode`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    async setMode(mode) {
        const url = `${this.host}/mode`;
        const options = {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({ mode }),
        };
        const response = await this.fetchWithRetry(url, options);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to set mode: ${errorBody}`);
        }
    }
    // Server Information
    async getServerInfo() {
        const url = `${this.host}/`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
}
exports.SchemaRegistryClient = SchemaRegistryClient;
exports.default = SchemaRegistryClient;
