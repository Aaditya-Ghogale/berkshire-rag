import { Mastra } from '@mastra/core';
import { buffettAgent } from './agents/buffettAgent';
import { ingestLetters } from '../workflows/ingestLetters';

export const mastra = new Mastra({
  agents: { buffettAgent },
  workflows: { ingestLetters }
});