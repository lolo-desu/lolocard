/* eslint-disable */
// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

fs.globSync('src/*/schema.ts').forEach(async schema_file => {
  const { Schema } = await import(path.resolve(import.meta.dirname, schema_file));
  fs.writeFileSync(
    path.join(path.dirname(schema_file), 'schema.json'),
    JSON.stringify(z.toJSONSchema(Schema, { io: 'input', reused: 'ref' }), null, 2),
  );
});
