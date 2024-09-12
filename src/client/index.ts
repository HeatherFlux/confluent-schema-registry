import {
  RetryOptions,
  SchemaRegistryAPIClientArgs,
  RegisterSchemaResponse,
  GetSchemaByIdResponse,
  GetAllVersionsResponse,
  GetAllSubjectsResponse,
  CompatibilityResponse,
  GlobalCompatibilityResponse,
  ModeResponse,
  ServerInfoResponse,
} from "./model";

// Default retry options
const DEFAULT_RETRY: RetryOptions = {
  retries: 3,
  retryDelay: 200,
};

/**
 *
 */
export class SchemaRegistryClient {
  private host: string;
  private auth?: { username: string; password: string };
  private clientId?: string;
  private retry: RetryOptions;

  /**
   *
   * @param root0
   * @param root0.host
   * @param root0.auth
   * @param root0.clientId
   * @param root0.retry
   */
  constructor({
    host,
    auth,
    clientId,
    retry = DEFAULT_RETRY,
  }: SchemaRegistryAPIClientArgs) {
    this.host = host;
    this.auth = auth;
    this.clientId = clientId;
    this.retry = { ...DEFAULT_RETRY, ...retry };
  }

  // Fetch with retry logic
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
  ): Promise<Response> {
    let attempt = 0;
    while (attempt < this.retry.retries) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;

        // Log the response and read the body to get more details
        const errorBody = await response.text(); // Read the response body
        console.log(`Error Response (Attempt ${attempt + 1}):`, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: errorBody, // Log the body content for more details
        });

        // Throw an error with the response status and body details
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}. Body: ${errorBody}`,
        )
      } catch (error: any) {
        if (attempt === this.retry.retries - 1) {
          throw new Error(
            `Failed to fetch ${url} after ${this.retry.retries} attempts: ${error.message}`,
          )
        }
      }
      attempt++;
      await new Promise((resolve) =>
        setTimeout(resolve, this.retry.retryDelay),
      )
    }
    throw new Error(
      `Failed to fetch ${url} after ${this.retry.retries} attempts`,
    )
  }

  // Get headers for requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.auth) {
      const basicAuth = Buffer.from(
        `${this.auth.username}:${this.auth.password}`,
      ).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }
    if (this.clientId) {
      headers['Client-Id'] = this.clientId;
    }
    return headers;
  }

  // Schema Operations

  /**
   *
   * @param subject
   * @param schema
   */
  public async registerSchema(
    subject: string,
    schema: object,
  ): Promise<RegisterSchemaResponse> {
    const url = `${this.host}/subjects/${subject}/versions`;
    const options: RequestInit = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        schema: JSON.stringify(schema), // Wrap the schema in an object with a schema key
      }),
    };

    const response = await this.fetchWithRetry(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to register schema: ${errorBody}`);
    }

    return response.json() as Promise<RegisterSchemaResponse>;
  }

  /**
   *
   * @param id
   */
  public async getSchemaById(id: number): Promise<GetSchemaByIdResponse> {
    const url = `${this.host}/schemas/ids/${id}`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };

    const response = await this.fetchWithRetry(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch schema with ID ${id}: ${errorBody}`);
    }

    return response.json() as Promise<GetSchemaByIdResponse>;
  }

  /**
   *
   * @param subject
   * @param version
   */
  public async getSchemaByVersion(
    subject: string,
    version: string = 'latest',
  ): Promise<GetSchemaByIdResponse> {
    const url = `${this.host}/subjects/${subject}/versions/${version}`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<GetSchemaByIdResponse>;
  }

  /**
   *
   * @param subject
   */
  public async getAllVersions(
    subject: string,
  ): Promise<GetAllVersionsResponse[]> {
    const url = `${this.host}/subjects/${subject}/versions`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<GetAllVersionsResponse[]>;
  }

  // Subject Operations

  /**
   *
   */
  public async getAllSubjects(): Promise<GetAllSubjectsResponse> {
    const url = `${this.host}/subjects`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<GetAllSubjectsResponse>;
  }

  /**
   *
   * @param subject
   */
  public async deleteSubject(subject: string): Promise<void> {
    const url = `${this.host}/subjects/${subject}`;
    const options: RequestInit = {
      method: 'DELETE',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to delete subject ${subject}: ${errorBody}`);
    }
  }

  // Compatibility Operations

  /**
   *
   * @param subject
   * @param version
   * @param schema
   */
  public async checkCompatibility(
    subject: string,
    version: string,
    schema: object,
  ): Promise<CompatibilityResponse> {
    const url = `${this.host}/compatibility/subjects/${subject}/versions/${version}`;
    const options: RequestInit = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(schema),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<CompatibilityResponse>;
  }

  /**
   *
   */
  public async getGlobalCompatibility(): Promise<GlobalCompatibilityResponse> {
    const url = `${this.host}/config`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<GlobalCompatibilityResponse>;
  }

  /**
   *
   * @param level
   */
  public async setGlobalCompatibility(level: string): Promise<void> {
    const url = `${this.host}/config`;
    const options: RequestInit = {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ compatibility: level }),
    };
    const response = await this.fetchWithRetry(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to set global compatibility: ${errorBody}`);
    }
  }

  // Mode Operations

  /**
   *
   */
  public async getMode(): Promise<ModeResponse> {
    const url = `${this.host}/mode`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<ModeResponse>;
  }

  /**
   *
   * @param mode
   */
  public async setMode(mode: string): Promise<void> {
    const url = `${this.host}/mode`;
    const options: RequestInit = {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ mode }),
    };

    const response = await this.fetchWithRetry(url, options);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to set mode: ${errorBody}`);
    }
  }

  // Server Information
  /**
   *
   */
  public async getServerInfo(): Promise<ServerInfoResponse> {
    const url = `${this.host}/`;
    const options: RequestInit = {
      method: 'GET',
      headers: this.getHeaders(),
    };
    const response = await this.fetchWithRetry(url, options);
    return response.json() as Promise<ServerInfoResponse>;
  }
}

export default SchemaRegistryClient;
