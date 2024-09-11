"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = decode;
/**
 * Decodes a Buffer into its constituent parts: magic byte, schema registry ID, and payload.
 *
 * @param buffer - The Buffer containing the encoded data.
 * @returns An object containing the magic byte, schema ID, and payload.
 */
function decode(buffer) {
    const magicByte = buffer.readUInt8(0);
    const registryId = buffer.readUInt32BE(1);
    const payload = buffer.subarray(5); // Use subarray instead of slice
    return { magicByte, registryId, payload };
}
exports.default = decode;
