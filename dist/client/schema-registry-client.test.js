"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __importDefault(require("."));
describe('SchemaRegistryClient', () => {
    const client = new _1.default({
        host: 'https://schema-registry-url',
        auth: { username: 'user', password: 'pass' },
        clientId: 'my-client-id',
    });
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    // Schemas
    describe('Schemas', () => {
        it('should register a new schema (Happy Path)', async () => {
            const mockResponse = { id: 1 };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const response = await client.registerSchema('my-subject', { type: 'record', name: 'MyRecord', fields: [] });
            expect(response).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/subjects/my-subject/versions', expect.objectContaining({
                method: 'POST',
                headers: expect.any(Object),
                body: JSON.stringify({ schema: JSON.stringify({ type: 'record', name: 'MyRecord', fields: [] }) }),
            }));
        });
        it('should handle network error when registering a schema (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.registerSchema('my-subject', { type: 'record', name: 'MyRecord', fields: [] })).rejects.toThrow('Failed to fetch');
        });
        it('should handle non-200 HTTP response when registering a schema (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Error body'),
            });
            await expect(client.registerSchema('my-subject', { type: 'record', name: 'MyRecord', fields: [] })).rejects.toThrow('HTTP error: 500 Internal Server Error. Body: Error body');
        });
        it('should fetch a schema by ID (Happy Path)', async () => {
            const mockResponse = { id: 1, schema: '{}' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const schema = await client.getSchemaById(1);
            expect(schema).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/schemas/ids/1', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when fetching a schema by ID (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getSchemaById(1)).rejects.toThrow('Failed to fetch');
        });
        it('should handle 404 Not Found when fetching a schema by ID (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: jest.fn().mockResolvedValue('Not found'),
            });
            await expect(client.getSchemaById(1)).rejects.toThrow('HTTP error: 404 Not Found. Body: Not found');
        });
        it('should fetch a schema by version (Happy Path)', async () => {
            const mockResponse = { id: 1, schema: '{}' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const schema = await client.getSchemaByVersion('my-subject', 'latest');
            expect(schema).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/subjects/my-subject/versions/latest', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when fetching a schema by version (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getSchemaByVersion('my-subject', 'latest')).rejects.toThrow('Failed to fetch');
        });
        it('should handle 500 Internal Server Error when fetching a schema by version (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Internal server error'),
            });
            await expect(client.getSchemaByVersion('my-subject', 'latest')).rejects.toThrow('HTTP error: 500 Internal Server Error. Body: Internal server error');
        });
    });
    // Subjects
    describe('Subjects', () => {
        it('should list all subjects (Happy Path)', async () => {
            const mockResponse = ['subject1', 'subject2'];
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const subjects = await client.getAllSubjects();
            expect(subjects).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/subjects', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when listing all subjects (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getAllSubjects()).rejects.toThrow('Failed to fetch');
        });
        it('should handle 403 Forbidden when listing all subjects (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                text: jest.fn().mockResolvedValue('Forbidden'),
            });
            await expect(client.getAllSubjects()).rejects.toThrow('HTTP error: 403 Forbidden. Body: Forbidden');
        });
        it('should delete a subject (Happy Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
            });
            const response = await client.deleteSubject('my-subject');
            expect(response).toBeUndefined();
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/subjects/my-subject', expect.objectContaining({
                method: 'DELETE',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when deleting a subject (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.deleteSubject('my-subject')).rejects.toThrow('Failed to fetch');
        });
        it('should handle 404 Not Found when deleting a subject (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: jest.fn().mockResolvedValue('Subject not found'),
            });
            await expect(client.deleteSubject('my-subject')).rejects.toThrow('HTTP error: 404 Not Found. Body: Subject not found');
        });
    });
    // Compatibility
    describe('Compatibility', () => {
        it('should check schema compatibility (Happy Path)', async () => {
            const mockResponse = { is_compatible: true };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const compatibility = await client.checkCompatibility('my-subject', 'latest', { type: 'record', name: 'MyRecord', fields: [] });
            expect(compatibility).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/compatibility/subjects/my-subject/versions/latest', expect.objectContaining({
                method: 'POST',
                headers: expect.any(Object),
                body: JSON.stringify({ type: 'record', name: 'MyRecord', fields: [] }),
            }));
        });
        it('should handle network error when checking schema compatibility (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.checkCompatibility('my-subject', 'latest', { type: 'record', name: 'MyRecord', fields: [] }))
                .rejects.toThrow('Failed to fetch');
        });
        it('should handle 400 Bad Request when checking schema compatibility (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                text: jest.fn().mockResolvedValue('Bad request'),
            });
            await expect(client.checkCompatibility('my-subject', 'latest', { type: 'record', name: 'MyRecord', fields: [] }))
                .rejects.toThrow('HTTP error: 400 Bad Request. Body: Bad request');
        });
        it('should get global compatibility level (Happy Path)', async () => {
            const mockResponse = { compatibilityLevel: 'FULL' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const compatibility = await client.getGlobalCompatibility();
            expect(compatibility).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/config', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when getting global compatibility level (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getGlobalCompatibility()).rejects.toThrow('Failed to fetch');
        });
        it('should handle 403 Forbidden when getting global compatibility level (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                text: jest.fn().mockResolvedValue('Forbidden'),
            });
            await expect(client.getGlobalCompatibility()).rejects.toThrow('HTTP error: 403 Forbidden. Body: Forbidden');
        });
        it('should set global compatibility level (Happy Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
            });
            const compatibility = await client.setGlobalCompatibility('FULL');
            expect(compatibility).toBeUndefined();
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/config', expect.objectContaining({
                method: 'PUT',
                headers: expect.any(Object),
                body: JSON.stringify({ compatibility: 'FULL' }),
            }));
        });
        it('should handle network error when setting global compatibility level (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.setGlobalCompatibility('FULL')).rejects.toThrow('Failed to fetch');
        });
        it('should handle 500 Internal Server Error when setting global compatibility level (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Server error'),
            });
            await expect(client.setGlobalCompatibility('FULL')).rejects.toThrow('HTTP error: 500 Internal Server Error. Body: Server error');
        });
    });
    // Modes
    describe('Modes', () => {
        it('should get mode (Happy Path)', async () => {
            const mockResponse = { mode: 'READWRITE' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const mode = await client.getMode();
            expect(mode).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/mode', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when getting mode (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getMode()).rejects.toThrow('Failed to fetch');
        });
        it('should handle 403 Forbidden when getting mode (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                text: jest.fn().mockResolvedValue('Forbidden'),
            });
            await expect(client.getMode()).rejects.toThrow('HTTP error: 403 Forbidden. Body: Forbidden');
        });
        it('should set mode (Happy Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
            });
            const mode = await client.setMode('READWRITE');
            expect(mode).toBeUndefined();
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/mode', expect.objectContaining({
                method: 'PUT',
                headers: expect.any(Object),
                body: JSON.stringify({ mode: 'READWRITE' }),
            }));
        });
        it('should handle network error when setting mode (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.setMode('READWRITE')).rejects.toThrow('Failed to fetch');
        });
        it('should handle 500 Internal Server Error when setting mode (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: jest.fn().mockResolvedValue('Server error'),
            });
            await expect(client.setMode('READWRITE')).rejects.toThrow('HTTP error: 500 Internal Server Error. Body: Server error');
        });
    });
    // Server Information
    describe('Server Information', () => {
        it('should get server information (Happy Path)', async () => {
            const mockResponse = { version: '5.4.0', commitId: 'abcdef' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });
            const serverInfo = await client.getServerInfo();
            expect(serverInfo).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith('https://schema-registry-url/', expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object),
            }));
        });
        it('should handle network error when getting server information (Sad Path)', async () => {
            global.fetch.mockRejectedValue(new Error('Network Error'));
            await expect(client.getServerInfo()).rejects.toThrow('Failed to fetch');
        });
        it('should handle 404 Not Found when getting server information (Sad Path)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                text: jest.fn().mockResolvedValue('Not found'),
            });
            await expect(client.getServerInfo()).rejects.toThrow('HTTP error: 404 Not Found. Body: Not found');
        });
    });
});
