import * as avro from 'avsc'
import { SchemaRegistryClient } from '../client'
import { decode, encode } from '../wire'

/**
 * A helper class for encoding and decoding Avro messages.
 */
export class AvroHelper {
  private schemaRegistryClient: SchemaRegistryClient

  /**
   * Creates a new AvroHelper instance.
   * @param schemaRegistryClient - The SchemaRegistryClient instance to use.
   */
  constructor(schemaRegistryClient: SchemaRegistryClient) {
    this.schemaRegistryClient = schemaRegistryClient
  }

  /**
   * Encodes a message using the provided Avro schema.
   * @param subject - The subject of the schema.
   * @param payload - The message payload to encode.
   * @returns The encoded message.
   */
  public async encodeMessage(subject: string, payload: object): Promise<Buffer> {
    const schema = await this.schemaRegistryClient.getSchemaByVersion(subject)
    const avroType = avro.Type.forSchema(schema.schema)
    const serializedPayload = avroType.toBuffer(payload)

    return encode(schema.id, serializedPayload)
  }

  /**
   * Decodes a message using the provided Avro schema.
   * @param buffer - The message buffer to decode.
   * @returns The decoded message.
   */
  // The package is also any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async decodeMessage(buffer: Buffer): Promise<any> {
    const { registryId, payload } = decode(buffer)
    const schema = await this.schemaRegistryClient.getSchemaById(registryId)
    const avroType = avro.Type.forSchema(schema.schema)

    return avroType.fromBuffer(payload)
  }
}
