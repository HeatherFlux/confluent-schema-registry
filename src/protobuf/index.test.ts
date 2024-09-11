import { Root } from 'protobufjs';
import ProtoHelper from '.';
import SchemaRegistryClient from '../client';

describe('ProtoHelper', () => {
  const client = new SchemaRegistryClient({
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
      schema: {/* Protobuf JSON schema */ },
      name: 'TestMessage',
    };
    const payload = { field1: 'test' };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(schema),
    });

    const protoHelper = new ProtoHelper(client);
    const buffer = await protoHelper.encodeMessage('test-subject', payload);
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it('should decode a Protobuf message (Happy Path)', async () => {
    const schema = {
      id: 1,
      schema: {/* Protobuf JSON schema */ },
      name: 'TestMessage',
    };
    const payload = { field1: 'test' };

    const root = Root.fromJSON(schema.schema);
    const messageType = root.lookupType(schema.name);
    const buffer = messageType.encode(messageType.create(payload)).finish();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(schema),
    });

    const protoHelper = new ProtoHelper(client);
    const decodedMessage = await protoHelper.decodeMessage(Buffer.from(buffer));
    expect(decodedMessage).toEqual(payload);
  });
});
