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
exports.AvroHelper = void 0;
const avro = __importStar(require("avsc"));
const wire_1 = require("../wire");
class AvroHelper {
    constructor(schemaRegistryClient) {
        this.schemaRegistryClient = schemaRegistryClient;
    }
    async encodeMessage(subject, payload) {
        const schema = await this.schemaRegistryClient.getSchemaByVersion(subject);
        const avroType = avro.Type.forSchema(schema.schema);
        const serializedPayload = avroType.toBuffer(payload);
        return (0, wire_1.encode)(schema.id, serializedPayload);
    }
    async decodeMessage(buffer) {
        const { registryId, payload } = (0, wire_1.decode)(buffer);
        const schema = await this.schemaRegistryClient.getSchemaById(registryId);
        const avroType = avro.Type.forSchema(schema.schema);
        return avroType.fromBuffer(payload);
    }
}
exports.AvroHelper = AvroHelper;
exports.default = AvroHelper;
