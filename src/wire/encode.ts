const MAGIC_BYTE = Buffer.alloc(1); // Magic byte is often set to 0

/**
 * Encodes a payload by prepending a magic byte and the schema registry ID.
 * @param registryId - The ID of the schema in the schema registry.
 * @param payload - The serialized Avro or Protobuf data.
 * @returns A Buffer containing the magic byte, schema ID, and payload.
 */
export function encode(registryId: number, payload: Buffer): Buffer {
  const registryIdBuffer = Buffer.alloc(4);
  registryIdBuffer.writeUInt32BE(registryId, 0);

  return Buffer.concat([MAGIC_BYTE, registryIdBuffer, payload]);
}

export default encode;
