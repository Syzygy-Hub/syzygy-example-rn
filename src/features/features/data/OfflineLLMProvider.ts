import { AIError } from 'syzygy-ai-rn';
import type {
  LLMChunk,
  LLMProvider,
  LLMRequest,
  LLMResponse,
} from 'syzygy-ai-rn';

const PROVIDER_NAME = 'offline';

/**
 * An offline LLMProvider for the example. It answers locally, needs no API key
 * and makes no network call. Replace it with a real provider to talk to a model.
 */
export class OfflineLLMProvider implements LLMProvider {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    const lastUser = [...request.messages]
      .reverse()
      .find(message => message.role === 'user');
    const prompt = lastUser?.content.trim() ?? '';
    if (prompt.length === 0) {
      throw new AIError('invalid_request', 'The prompt is empty.');
    }
    return {
      content: `Offline reply to: ${prompt}`,
      finishReason: 'stop',
      providerName: PROVIDER_NAME,
      modelName: request.model,
    };
  }

  async *stream(request: LLMRequest): AsyncIterable<LLMChunk> {
    const response = await this.complete(request);
    yield {
      content: response.content,
      providerName: PROVIDER_NAME,
      modelName: request.model,
    };
    yield { finishReason: 'stop', providerName: PROVIDER_NAME };
  }
}
