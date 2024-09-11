import * as protobuf from 'protobufjs';
import SchemaRegistryClient from '../client';
import { decode, encode } from '../wire';

export class ProtoHelper {
  private schemaRegistryClient: SchemaRegistryClient;

  constructor(schemaRegistryClient: SchemaRegistryClient) {
    this.schemaRegistryClient = schemaRegistryClient;
  }

  public async encodeMessage(subject: string, payload: object): Promise<Buffer> {
    const res = await this.schemaRegistryClient.getSchemaByVersion(subject);
    const schema = JSON.parse(res.schema);
    const root = protobuf.Root.fromJSON(schema) // Convert the schema to a Protobuf root
    const messageType = root.lookupType(schema.name); // Get the message type
    const errMsg = messageType.verify(payload); // Verify the payload
    if (errMsg) throw Error(errMsg);

    const message = messageType.create(payload); // Create a message
    const serializedPayload = messageType.encode(message).finish() // Serialize to buffer

    return encode(schema.id, Buffer.from(serializedPayload)); // Wire encode
  }

  public async decodeMessage(buffer: Buffer): Promise<any> {
    const { registryId, payload } = decode(buffer); // Wire decode
    const schema = await this.schemaRegistryClient.getSchemaById(registryId);
    const root = protobuf.Root.fromJSON(schema.schema); // Convert the schema to a Protobuf root
    const messageType = root.lookupType(schema.name); // Get the message type

    return messageType.decode(payload); // Decode the payload
  }
}

export default ProtoHelper;
