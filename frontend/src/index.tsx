import { createRoot } from 'react-dom/client';
import App from './App';

import './index.css';

const container = document.querySelector('#app');
if (!container) {
  throw new Error('No se pudo encontrar el elemento raíz');
}
const root = createRoot(container);

root.render(<App />);
