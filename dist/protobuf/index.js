"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtoHelper = void 0;
const protobuf = __importStar(require("protobufjs"));
const wire_1 = require("../wire");
class ProtoHelper {
    constructor(schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }
    async encodeMessage(subject, payload) {
        const res = await this.schemaRegistryClient.getSchemaByVersion(subject);
        const schema = JSON.parse(res.schema);
        const root = protobuf.Root.fromJSON(schema); // Convert the schema to a Protobuf root
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
        const schema = await this.schemaRegistryClient.getSchemaById(registryId);
        const root = protobuf.Root.fromJSON(schema.schema); // Convert the schema to a Protobuf root
        const messageType = root.lookupType(schema.name); // Get the message type
        return messageType.decode(payload); // Decode the payload
    }
}
exports.ProtoHelper = ProtoHelper;
exports.default = ProtoHelper;
