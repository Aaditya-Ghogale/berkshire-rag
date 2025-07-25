const { createWorkflow } = require('@mastra/core/workflows');
const { z } = require('zod');
exports.testWorkflow = createWorkflow({
  id: 'testWorkflow',
  inputSchema: z.object({}),
  outputSchema: z.object({ result: z.string() }),
  execute: async () => ({ result: 'Hello from testWorkflow!' }),
});