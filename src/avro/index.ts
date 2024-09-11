import * as avro from 'avsc';
import SchemaRegistryClient from '../client';
import { decode, encode } from '../wire';

export class AvroHelper {
  private schemaRegistryClient: SchemaRegistryClient;

  constructor(schemaRegistryClient: SchemaRegistryClient) {
    this.schemaRegistryClient = schemaRegistryClient;
  }

  public async encodeMessage(subject: string, payload: object): Promise<Buffer> {
    const schema = await this.schemaRegistryClient.getSchemaByVersion(subject);
    const avroType = avro.Type.forSchema(schema.schema);
    const serializedPayload = avroType.toBuffer(payload);

    return encode(schema.id, serializedPayload);
  }

  public async decodeMessage(buffer: Buffer): Promise<any> {
    const { registryId, payload } = decode(buffer);
    const schema = await this.schemaRegistryClient.getSchemaById(registryId);
    const avroType = avro.Type.forSchema(schema.schema);

    return avroType.fromBuffer(payload);
  }
}

export default AvroHelper;
