/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SyllabusProvider } from './context/SyllabusContext';
import { AppRouter } from './app/Router';

export default function App() {
  return (
    <SyllabusProvider>
      <AppRouter />
    </SyllabusProvider>
  );
}


