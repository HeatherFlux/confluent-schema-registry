"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs_1 = require("protobufjs");
const _1 = __importDefault(require("."));
const client_1 = __importDefault(require("../client"));
describe('ProtoHelper', () => {
    const client = new client_1.default({
        host: 'https://schema-registry-url',
        auth: { username: 'user', password: 'pass' }
    });
    beforeEach(() => {
        global.fetch = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should encode a Protobuf message (Happy Path)', async () => {
        const schema = {
            id: 1,
            schema: { /* Protobuf JSON schema */},
            name: 'TestMessage',
        };
        const payload = { field1: 'test' };
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(schema),
        });
        const protoHelper = new _1.default(client);
        const buffer = await protoHelper.encodeMessage('test-subject', payload);
        expect(buffer).toBeInstanceOf(Buffer);
    });
    it('should decode a Protobuf message (Happy Path)', async () => {
        const schema = {
            id: 1,
            schema: { /* Protobuf JSON schema */},
            name: 'TestMessage',
        };
        const payload = { field1: 'test' };
        const root = protobufjs_1.Root.fromJSON(schema.schema);
        const messageType = root.lookupType(schema.name);
        const buffer = messageType.encode(messageType.create(payload)).finish();
        global.fetch.mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(schema),
        });
        const protoHelper = new _1.default(client);
        const decodedMessage = await protoHelper.decodeMessage(Buffer.from(buffer));
        expect(decodedMessage).toEqual(payload);
    });
});
