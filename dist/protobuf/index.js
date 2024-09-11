"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoHelper = void 0;
const protobufjs_1 = require("protobufjs");
const wire_1 = require("../wire");
class ProtoHelper {
    constructor(schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }
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
    async decodeMessage(buffer) {
        const { registryId, payload } = (0, wire_1.decode)(buffer); // Wire decode
        const res = await this.schemaRegistryClient.getSchemaById(registryId);
        const root = protobufjs_1.Root.fromJSON(JSON.parse(res.schema)); // Convert the schema to a Protobuf root
        const messageType = root.lookupType(res.subject); // Get the message type
        return messageType.decode(payload); // Decode the payload
    }
}
exports.ProtoHelper = ProtoHelper;
exports.default = ProtoHelper;
