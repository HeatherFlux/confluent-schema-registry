import { Root } from 'protobufjs'
import { decode, encode } from '../wire'
import { SchemaRegistryClient } from '../client'
import { ProtoHelper } from './'

jest.mock('../client')
jest.mock('protobufjs')
jest.mock('../wire')

describe('ProtoHelper', () => {
  let schemaRegistryClient: SchemaRegistryClient
  let protoHelper: ProtoHelper

  beforeEach(() => {
    // Create a mock SchemaRegistryClient
    schemaRegistryClient = new SchemaRegistryClient({
      host: 'http://localhost:8081',
      auth: { username: 'user', password: 'pass' },
      clientId: 'client-id',
      retry: { retries: 3 },
    }) as jest.Mocked<SchemaRegistryClient>

    protoHelper = new ProtoHelper(schemaRegistryClient)

    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('encodeMessage', () => {
    it('should encode a message with the correct schema', async () => {
      const subject = 'test-subject'
      const payload = { name: 'test', age: 30 }
      const schemaResponse = {
        id: 1,
        schema: JSON.stringify({
          name: 'TestMessage',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int32' },
          ],
        }),
      }

      // Mock schemaRegistryClient.getSchemaByVersion
      schemaRegistryClient.getSchemaByVersion = jest.fn().mockResolvedValue(schemaResponse)

      // Mock Root.fromJSON
      const rootMock = {
        lookupType: jest.fn().mockReturnValue({
          verify: jest.fn().mockReturnValue(null),
          create: jest.fn().mockReturnValue({}),
          encode: jest.fn().mockReturnValue({
            finish: jest.fn().mockReturnValue(Buffer.from('serialized')),
          }),
        }),
      }
      ;(Root.fromJSON as jest.Mock).mockReturnValue(rootMock)

      // Mock encode function
      const encodedBuffer = Buffer.from('encoded')
      ;(encode as jest.Mock).mockReturnValue(encodedBuffer)

      // Call the encodeMessage method
      const result = await protoHelper.encodeMessage(subject, payload)

      // Assertions
      expect(schemaRegistryClient.getSchemaByVersion).toHaveBeenCalledWith(subject)
      expect(Root.fromJSON).toHaveBeenCalledWith(JSON.parse(schemaResponse.schema))
      expect(rootMock.lookupType).toHaveBeenCalledWith('TestMessage')
      expect(result).toBe(encodedBuffer)
    })

    it('should throw an error if the payload is invalid', async () => {
      const subject = 'test-subject'
      const payload = { name: 'test', age: 'invalid' }
      const schemaResponse = {
        id: 1,
        schema: JSON.stringify({
          name: 'TestMessage',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int32' },
          ],
        }),
      }

      // Mock schemaRegistryClient.getSchemaByVersion
      schemaRegistryClient.getSchemaByVersion = jest.fn().mockResolvedValue(schemaResponse)

      // Mock Root.fromJSON
      const rootMock = {
        lookupType: jest.fn().mockReturnValue({
          verify: jest.fn().mockReturnValue('Invalid payload'),
          create: jest.fn().mockReturnValue({}),
          encode: jest.fn().mockReturnValue({
            finish: jest.fn().mockReturnValue(Buffer.from('serialized')),
          }),
        }),
      }
      ;(Root.fromJSON as jest.Mock).mockReturnValue(rootMock)

      // Expect the encodeMessage to throw
      await expect(protoHelper.encodeMessage(subject, payload)).rejects.toThrow('Invalid payload')
    })
  })

  describe('decodeMessage', () => {
    it('should decode a message with the correct schema', async () => {
      const buffer = Buffer.from('encoded')
      const decodedPayload = { name: 'test', age: 30 }
      const registryId = 1
      const schemaResponse = {
        id: registryId,
        schema: JSON.stringify({
          name: 'TestMessage',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'int32' },
          ],
        }),
      }

      // Mock decode function
      ;(decode as jest.Mock).mockReturnValue({ registryId, payload: Buffer.from('payload') })

      // Mock getSchemaById
      schemaRegistryClient.getSchemaById = jest.fn().mockResolvedValue(schemaResponse)

      // Mock Root.fromJSON
      const rootMock = {
        lookupType: jest.fn().mockReturnValue({
          decode: jest.fn().mockReturnValue(decodedPayload),
        }),
      }
      ;(Root.fromJSON as jest.Mock).mockReturnValue(rootMock)

      // Call decodeMessage
      const result = await protoHelper.decodeMessage(buffer)

      // Assertions
      expect(decode).toHaveBeenCalledWith(buffer)
      expect(schemaRegistryClient.getSchemaById).toHaveBeenCalledWith(registryId)
      expect(Root.fromJSON).toHaveBeenCalledWith(JSON.parse(schemaResponse.schema))
      expect(result).toBe(decodedPayload)
    })

    it('should throw an error if decoding fails', async () => {
      const buffer = Buffer.from('invalid')

      // Mock decode to throw an error
      ;(decode as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid buffer')
      })

      // Expect the decodeMessage to throw
      await expect(protoHelper.decodeMessage(buffer)).rejects.toThrow('Invalid buffer')
    })
  })
})
