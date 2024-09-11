"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("./client"));
const avro_1 = __importDefault(require("./avro"));
const protobuf_1 = __importDefault(require("./protobuf"));
describe('Integration Tests with Confluent Cloud and Local Services', () => {
    if (!process.env.SCHEMA_REGISTRY_URL) {
        throw new Error('SCHEMA_REGISTRY_URL is not set');
    }
    const client = new client_1.default({
        host: process.env.SCHEMA_REGISTRY_URL,
    });
    let avroHelper;
    let protoHelper;
    beforeAll(() => {
        avroHelper = new avro_1.default(client);
        protoHelper = new protobuf_1.default(client);
    });
    it('should register and fetch an Avro schema', async () => {
        const subject = 'test-subject-avro';
        const schema = {
            type: 'record',
            name: 'TestRecord',
            fields: [{ name: 'field1', type: 'string' }],
        };
        const res = await client.registerSchema(subject, schema);
        console.log(res);
        expect(res.id).toBeDefined();
        const fetchedSchema = await client.getSchemaById(res.id);
        expect(fetchedSchema.schema).toEqual(JSON.stringify(schema));
    });
    it('should register and fetch a Protobuf schema', async () => {
        const subject = 'test-subject-protobuf';
        const schema = {
            "nested": {
                "TestMessage": {
                    "fields": {
                        "field1": {
                            "type": "string",
                            "id": 1
                        }
                    }
                }
            }
        };
        const res = await client.registerSchema(subject, schema);
        expect(res).toBeDefined();
        const fetchedSchema = await client.getSchemaById(res.id);
        expect(fetchedSchema.schema).toEqual(schema);
    });
    // 2. Message Encoding/Decoding Tests
    it('should encode and decode Avro messages', async () => {
        const subject = 'test-subject-avro';
        const payload = { field1: 'test' };
        await client.registerSchema(subject, {
            type: 'record',
            name: 'TestRecord',
            fields: [{ name: 'field1', type: 'string' }],
        });
        const encodedMessage = await avroHelper.encodeMessage(subject, payload);
        const decodedMessage = await avroHelper.decodeMessage(encodedMessage);
        expect(decodedMessage).toEqual(payload);
    });
    it('should encode and decode Protobuf messages', async () => {
        const subject = 'test-subject-protobuf';
        const schema = {
            "nested": {
                "TestMessage": {
                    "fields": {
                        "field1": {
                            "type": "string",
                            "id": 1
                        }
                    }
                }
            }
        };
        const payload = { field1: 'test' };
        await client.registerSchema(subject, schema);
        const encodedMessage = await protoHelper.encodeMessage(subject, payload);
        const decodedMessage = await protoHelper.decodeMessage(encodedMessage);
        expect(decodedMessage).toEqual(payload);
    });
    // 3. Schema Compatibility Test
    it('should check schema compatibility', async () => {
        const subject = 'test-subject-avro';
        const schema = {
            type: 'record',
            name: 'TestRecord',
            fields: [{ name: 'field1', type: 'string' }],
        };
        await client.registerSchema(subject, schema);
        const newSchema = {
            type: 'record',
            name: 'TestRecord',
            fields: [{ name: 'field1', type: 'string' }, { name: 'field2', type: 'int' }],
        };
        const compatibility = await client.checkCompatibility(subject, '1', newSchema);
        expect(compatibility.is_compatible).toBe(true);
    });
    // 5. Error Handling Tests
    it('should handle schema not found error', async () => {
        await expect(client.getSchemaById(99999)).rejects.toThrow('Schema not found');
    });
    it('should handle encoding error for invalid payload', async () => {
        const subject = 'test-subject-avro';
        const payload = { field2: 'test' }; // field2 does not exist in the schema
        await client.registerSchema(subject, {
            type: 'record',
            name: 'TestRecord',
            fields: [{ name: 'field1', type: 'string' }],
        });
        await expect(avroHelper.encodeMessage(subject, payload)).rejects.toThrow('Invalid payload');
    });
});
