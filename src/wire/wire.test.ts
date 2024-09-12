import { decode, encode } from '.'

describe('wire functions', () => {
  describe('decode', () => {
    it('should correctly decode a buffer into magicByte, registryId, and payload', () => {
      const magicByte = 0
      const registryId = 12345
      const payload = Buffer.from([0x01, 0x02, 0x03])

      // Create the buffer for testing
      const buffer = Buffer.alloc(5 + payload.length)
      buffer.writeUInt8(magicByte, 0)
      buffer.writeUInt32BE(registryId, 1)
      payload.copy(buffer, 5)

      // Call the decode function
      const result = decode(buffer)

      // Assertions
      expect(result.magicByte).toBe(magicByte)
      expect(result.registryId).toBe(registryId)
      expect(result.payload.equals(payload)).toBe(true)
    })

    it('should handle empty payload correctly', () => {
      const magicByte = 0
      const registryId = 12345

      // Create the buffer with no payload
      const buffer = Buffer.alloc(5)
      buffer.writeUInt8(magicByte, 0)
      buffer.writeUInt32BE(registryId, 1)

      // Call the decode function
      const result = decode(buffer)

      // Assertions
      expect(result.magicByte).toBe(magicByte)
      expect(result.registryId).toBe(registryId)
      expect(result.payload.length).toBe(0) // No payload
    })

    it('should throw an error if the buffer is too small', () => {
      const buffer = Buffer.alloc(3) // Not enough space for magic byte and registryId

      expect(() => decode(buffer)).toThrow(new RangeError('Attempt to access memory outside buffer bounds'))
    })
  })

  describe('encode', () => {
    it('should correctly encode a payload with a magic byte and registryId', () => {
      const registryId = 12345
      const payload = Buffer.from([0x01, 0x02, 0x03])

      // Call the encode function
      const result = encode(registryId, payload)

      // Expected buffer content
      const expectedBuffer = Buffer.alloc(1 + 4 + payload.length)
      expectedBuffer.writeUInt8(0, 0) // Magic byte is 0
      expectedBuffer.writeUInt32BE(registryId, 1)
      payload.copy(expectedBuffer, 5)

      // Assertions
      expect(result.equals(expectedBuffer)).toBe(true)
    })

    it('should handle empty payload correctly', () => {
      const registryId = 12345
      const payload = Buffer.alloc(0)

      // Call the encode function
      const result = encode(registryId, payload)

      // Expected buffer content
      const expectedBuffer = Buffer.alloc(1 + 4)
      expectedBuffer.writeUInt8(0, 0) // Magic byte is 0
      expectedBuffer.writeUInt32BE(registryId, 1)

      // Assertions
      expect(result.equals(expectedBuffer)).toBe(true)
    })
  })
})
