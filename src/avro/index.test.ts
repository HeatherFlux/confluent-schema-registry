import * as avro from 'avsc'
import { SchemaRegistryClient } from '../client'
import { decode, encode } from '../wire'
import { AvroHelper } from './'

jest.mock('../client')
jest.mock('avsc')
jest.mock('../wire')

describe('AvroHelper', () => {
  let schemaRegistryClient: SchemaRegistryClient
  let avroHelper: AvroHelper

  beforeEach(() => {
    // Create a mock SchemaRegistryClient
    schemaRegistryClient = new SchemaRegistryClient({
      host: 'http://localhost:8081',
      auth: { username: 'user', password: 'pass' },
      clientId: 'client-id',
      retry: { retries: 3 },
    }) as jest.Mocked<SchemaRegistryClient>

    avroHelper = new AvroHelper(schemaRegistryClient)

    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('encodeMessage', () => {
    it('should encode a message with the correct schema', async () => {
      const subject = 'test-subject'
      const payload = { name: 'test', age: 30 }
      const schemaResponse = {
        id: 1,
        schema: {
          type: 'record',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int' },
          ],
        },
      }

      // Mock getSchemaByVersion
      schemaRegistryClient.getSchemaByVersion = jest.fn().mockResolvedValue(schemaResponse)

      // Mock avro.Type.forSchema
      const avroTypeMock = {
        toBuffer: jest.fn().mockReturnValue(Buffer.from('serialized')),
      }
      avro.Type.forSchema = jest.fn().mockReturnValue(avroTypeMock)

      // Mock encode function
      const encodedBuffer = Buffer.from('encoded')
      ;(encode as jest.Mock).mockReturnValue(encodedBuffer)

      // Call the encodeMessage method
      const result = await avroHelper.encodeMessage(subject, payload)

      // Assertions
      expect(schemaRegistryClient.getSchemaByVersion).toHaveBeenCalledWith(subject)
      expect(avro.Type.forSchema).toHaveBeenCalledWith(schemaResponse.schema)
      expect(avroTypeMock.toBuffer).toHaveBeenCalledWith(payload)
      expect(encode).toHaveBeenCalledWith(schemaResponse.id, Buffer.from('serialized'))
      expect(result).toBe(encodedBuffer)
    })

    it('should throw an error if schemaRegistryClient fails to fetch schema', async () => {
      const subject = 'test-subject'
      const payload = { name: 'test', age: 30 }

      // Mock getSchemaByVersion to reject
      schemaRegistryClient.getSchemaByVersion = jest.fn().mockRejectedValue(new Error('Schema not found'))

      // Expect the encodeMessage to throw
      await expect(avroHelper.encodeMessage(subject, payload)).rejects.toThrow('Schema not found')
    })
  })

  describe('decodeMessage', () => {
    it('should decode a message with the correct schema', async () => {
      const buffer = Buffer.from('encoded')
      const decodedPayload = { name: 'test', age: 30 }
      const registryId = 1
      const schemaResponse = {
        id: registryId,
        schema: {
          type: 'record',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int' },
          ],
        },
      }

      // Mock decode function
      ;(decode as jest.Mock).mockReturnValue({ registryId, payload: Buffer.from('payload') })

      // Mock getSchemaById
      schemaRegistryClient.getSchemaById = jest.fn().mockResolvedValue(schemaResponse)

      // Mock avro.Type.forSchema
      const avroTypeMock = {
        fromBuffer: jest.fn().mockReturnValue(decodedPayload),
      }
      avro.Type.forSchema = jest.fn().mockReturnValue(avroTypeMock)

      // Call decodeMessage
      const result = await avroHelper.decodeMessage(buffer)

      // Assertions
      expect(decode).toHaveBeenCalledWith(buffer)
      expect(schemaRegistryClient.getSchemaById).toHaveBeenCalledWith(registryId)
      expect(avro.Type.forSchema).toHaveBeenCalledWith(schemaResponse.schema)
      expect(avroTypeMock.fromBuffer).toHaveBeenCalledWith(Buffer.from('payload'))
      expect(result).toBe(decodedPayload)
    })

    it('should throw an error if decoding fails', async () => {
      const buffer = Buffer.from('invalid')

      // Mock decode to throw an error
      ;(decode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid buffer')
      })

      // Expect the decodeMessage to throw
      await expect(avroHelper.decodeMessage(buffer)).rejects.toThrow('Invalid buffer')
    })
  })
})
