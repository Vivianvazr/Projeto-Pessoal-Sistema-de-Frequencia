import express from 'express';
import helmet from 'helmet';
import registryRouter from './registry';

const app = express();
const PORT = 3000;

app.use(helmet());
app.use('/registry', registryRouter); // Monta as rotas em /registry

app.listen(PORT, () => {
  console.log(`Servidor em http://localhost:${PORT}`);
});
