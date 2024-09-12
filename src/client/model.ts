// Retry configuration options
export interface RetryOptions {
  retries: number;
  retryDelay: number; // in milliseconds
}

// Schema Registry Client initialization options
export interface SchemaRegistryAPIClientArgs {
  host: string;
  auth?: { username: string; password: string };
  clientId?: string;
  retry?: Partial<RetryOptions>;
}

// Schema registration request payload
export interface RegisterSchemaRequest {
  schema: string; // The Avro schema as a string
}

// Response when registering a schema
export interface RegisterSchemaResponse {
  id: number;
  subject: string;
  version: number;
  schema: string;
}

// Response when fetching a schema by ID
export interface GetSchemaByIdResponse {
  schema: string;
  subject: string;
  version: number;
  id: number;
}

// Response when getting all versions of a subject
export interface GetAllVersionsResponse {
  subject: string;
  version: number;
  id: number;
}

// Compatibility check response
export interface CompatibilityResponse {
  is_compatible: boolean;
}

// Global compatibility level
export interface GlobalCompatibilityResponse {
  compatibility: string;
}

// Mode response
export interface ModeResponse {
  mode: string;
}

// Server information response
export interface ServerInfoResponse {
  version: string;
  url: string;
  compatibility: string;
}

// Retry configuration options
export interface RetryOptions {
  retries: number;
  retryDelay: number; // in milliseconds
}

// Schema Registry Client initialization options
export interface SchemaRegistryAPIClientArgs {
  host: string;
  auth?: { username: string; password: string };
  clientId?: string;
  retry?: Partial<RetryOptions>;
}

// Schema registration request payload
export interface RegisterSchemaRequest {
  schema: string; // The Avro schema as a string
}

// Response when registering a schema
export interface RegisterSchemaResponse {
  id: number;
  subject: string;
  version: number;
  schema: string;
}

// Response when fetching a schema by ID
export interface GetSchemaByIdResponse {
  schema: string;
  subject: string;
  version: number;
  id: number;
}

// Response when getting all versions of a subject
export interface GetAllVersionsResponse {
  subject: string;
  version: number;
  id: number;
}

// Response when listing all subjects
export type GetAllSubjectsResponse = string[];

// Compatibility check response
export interface CompatibilityResponse {
  is_compatible: boolean;
}

// Global compatibility level
export interface GlobalCompatibilityResponse {
  compatibility: string;
}

// Mode response
export interface ModeResponse {
  mode: string;
}

// Server information response
export interface ServerInfoResponse {
  version: string;
  url: string;
  compatibility: string;
}
