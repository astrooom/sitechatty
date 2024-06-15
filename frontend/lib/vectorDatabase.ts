import { QdrantClient } from '@qdrant/js-client-rest';
export const vectorDb = new QdrantClient({ url: 'http://qdrant:6333' });