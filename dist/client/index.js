"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryClient = void 0;
// Default retry options
const DEFAULT_RETRY = {
    retries: 3,
    retryDelay: 200,
};
/**
 * Schema Registry Client
 */
class SchemaRegistryClient {
    host;
    auth;
    clientId;
    retry;
    /**
     * Creates a new SchemaRegistryClient instance.
     * @param root0 - The SchemaRegistryAPIClientArgs object.
     * @param root0.host - The Schema Registry host.
     * @param root0.auth - The basic auth credentials.
     * @param root0.clientId - The client ID.
     * @param root0.retry - The retry options.
     */
    constructor({ host, auth, clientId, retry = DEFAULT_RETRY }) {
        this.host = host;
        this.auth = auth;
        this.clientId = clientId;
        this.retry = { ...DEFAULT_RETRY, ...retry };
    }
    /**
     * Fetch with retry
     * @param url - the url
     * @param options - the request options
     * @returns the response
     */
    async fetchWithRetry(url, options) {
        let attempt = 0;
        while (attempt < this.retry.retries) {
            try {
                const response = await fetch(url, options);
                if (response.ok)
                    return response;
                // Log the response and read the body to get more details
                const errorBody = await response.text(); // Read the response body
                // console.log(`Error Response (Attempt ${attempt + 1}):`, {
                //   status: response.status,
                //   statusText: response.statusText,
                //   headers: response.headers,
                //   body: errorBody, // Log the body content for more details
                // })
                // Throw an error with the response status and body details
                throw new Error(`HTTP error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
            }
            catch (error) {
                if (attempt === this.retry.retries - 1) {
                    throw new Error(`Failed to fetch ${url} after ${this.retry.retries} attempts: ${error.message}`);
                }
            }
            attempt++;
            await new Promise((resolve) => setTimeout(resolve, this.retry.retryDelay));
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
    /**
     * Register a new schema
     * @param subject - the subject
     * @param schema - the schema
     * @returns the register schema response
     */
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
    /**
     * Get a schema by ID
     * @param id - the schema ID
     * @returns the schema response
     */
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
    /**
     * Get a schema by subject and version
     * @param subject - the subject
     * @param version - the version
     * @returns the schema response
     */
    async getSchemaByVersion(subject, version = 'latest') {
        const url = `${this.host}/subjects/${subject}/versions/${version}`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    /**
     * Get all versions of a schema
     * @param subject - the subject
     * @returns the schema response
     */
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
    /**
     * Get all subjects
     * @returns the subjects response
     */
    async getAllSubjects() {
        const url = `${this.host}/subjects`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    /**
     * Delete a subject
     * @param subject - the subject
     */
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
    /**
     * Check compatibility
     * @param subject - the subject
     * @param version - the version
     * @param schema - the schema
     * @returns the compatibility response
     */
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
    /**
     * Get compatibility
     * @returns the compatibility response
     */
    async getGlobalCompatibility() {
        const url = `${this.host}/config`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    /**
     * Set global compatibility
     * @param level - the compatibility level
     */
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
    /**
     * Get mode
     * @returns the mode response
     */
    async getMode() {
        const url = `${this.host}/mode`;
        const options = {
            method: 'GET',
            headers: this.getHeaders(),
        };
        const response = await this.fetchWithRetry(url, options);
        return response.json();
    }
    /**
     * Set mode
     * @param mode - the mode
     */
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
    /**
     * Get server information
     * @returns the server info response
     */
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
//# sourceMappingURL=index.js.map