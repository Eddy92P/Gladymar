import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { AuthContextProvider } from './store/auth-context';
import { StoreContextProvider } from './store/store-context';
import { PaginationContextProvider } from './store/pagination-context';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<AuthContextProvider>
			<StoreContextProvider>
				<PaginationContextProvider>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</PaginationContextProvider>
			</StoreContextProvider>
		</AuthContextProvider>
	</StrictMode>
);
