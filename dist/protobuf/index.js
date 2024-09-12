"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoHelper = void 0;
const protobufjs_1 = require("protobufjs");
const wire_1 = require("../wire");
/**
 * Helper class for working with Protobuf and Schema Registry.
 */
class ProtoHelper {
    schemaRegistryClient;
    /**
     * Initializes a new instance of the ProtoHelper class.
     * @param {SchemaRegistryClient} schemaRegistryClient - An instance of SchemaRegistryClient used for schema fetching.
     */
    constructor(schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }
    /**
     * Encodes a message using a Protobuf schema retrieved from the Schema Registry.
     * @param {string} subject - The subject (schema name) to be used for retrieving the schema from the registry.
     * @param {object} payload - The message payload that needs to be encoded.
     * @returns {Promise<Buffer>} - A promise that resolves to the encoded message in Buffer format.
     * @throws {Error} If the payload doesn't match the schema or any encoding error occurs.
     */
    async encodeMessage(subject, payload) {
        const res = await this.schemaRegistryClient.getSchemaByVersion(subject);
        const schema = JSON.parse(res.schema);
        const root = protobufjs_1.Root.fromJSON(schema); // Convert the schema to a Protobuf root
        const messageType = root.lookupType(schema.name); // Get the message type
        const errMsg = messageType.verify(payload); // Verify the payload
        if (errMsg)
            throw Error(errMsg);
        const message = messageType.create(payload); // Create a message
        const serializedPayload = messageType.encode(message).finish(); // Serialize to buffer
        return (0, wire_1.encode)(schema.id, Buffer.from(serializedPayload)); // Wire encode
    }
    /**
     * Decodes a message from a Buffer using the schema fetched from the Schema Registry.
     * @param {Buffer} buffer - The buffer containing the encoded message.
     * @returns {Promise<any>} - A promise that resolves to the decoded message.
     */
    async decodeMessage(buffer) {
        const { registryId, payload } = (0, wire_1.decode)(buffer); // Wire decode
        const res = await this.schemaRegistryClient.getSchemaById(registryId);
        const root = protobufjs_1.Root.fromJSON(JSON.parse(res.schema)); // Convert the schema to a Protobuf root
        const messageType = root.lookupType(res.subject); // Get the message type
        return messageType.decode(payload); // Decode the payload
    }
}
exports.ProtoHelper = ProtoHelper;
//# sourceMappingURL=index.js.map