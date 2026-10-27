import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import yaml from 'yaml';

const router = Router();

const specificationPath = fileURLToPath(
  new URL('../../docs/openapi.yaml', import.meta.url)
);

const specificationText = await readFile(
  specificationPath,
  'utf8'
);

const specification = yaml.parse(specificationText);

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(specification)
);

router.get('/openapi.yaml', (req, res) => {
  res.type('text/yaml').send(specificationText);
});

export default router;