import { Message, Root } from 'protobufjs'
import { decode, encode } from '../wire'
import { SchemaRegistryClient } from '../client'

/**
 * Helper class for working with Protobuf and Schema Registry.
 */
export class ProtoHelper {
  private schemaRegistryClient: SchemaRegistryClient

  /**
   * Initializes a new instance of the ProtoHelper class.
   * @param {SchemaRegistryClient} schemaRegistryClient - An instance of SchemaRegistryClient used for schema fetching.
   */
  constructor(schemaRegistryClient: SchemaRegistryClient) {
    this.schemaRegistryClient = schemaRegistryClient
  }

  /**
   * Encodes a message using a Protobuf schema retrieved from the Schema Registry.
   * @param {string} subject - The subject (schema name) to be used for retrieving the schema from the registry.
   * @param {object} payload - The message payload that needs to be encoded.
   * @returns {Promise<Buffer>} - A promise that resolves to the encoded message in Buffer format.
   * @throws {Error} If the payload doesn't match the schema or any encoding error occurs.
   */
  public async encodeMessage(subject: string, payload: object): Promise<Buffer> {
    const res = await this.schemaRegistryClient.getSchemaByVersion(subject)
    const schema = JSON.parse(res.schema)
    const root = Root.fromJSON(schema) // Convert the schema to a Protobuf root
    const messageType = root.lookupType(schema.name) // Get the message type
    const errMsg = messageType.verify(payload) // Verify the payload
    if (errMsg) throw Error(errMsg)

    const message = messageType.create(payload) // Create a message
    const serializedPayload = messageType.encode(message).finish() // Serialize to buffer

    return encode(schema.id, Buffer.from(serializedPayload)) // Wire encode
  }

  /**
   * Decodes a message from a Buffer using the schema fetched from the Schema Registry.
   * @param {Buffer} buffer - The buffer containing the encoded message.
   * @returns {Promise<any>} - A promise that resolves to the decoded message.
   */
  public async decodeMessage(buffer: Buffer): Promise<Message<object>> {
    const { registryId, payload } = decode(buffer) // Wire decode
    const res = await this.schemaRegistryClient.getSchemaById(registryId)
    const root = Root.fromJSON(JSON.parse(res.schema)) // Convert the schema to a Protobuf root
    const messageType = root.lookupType(res.subject) // Get the message type

    return messageType.decode(payload) // Decode the payload
  }
}
