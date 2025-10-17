const dev = {
	url: {
		HOST: 'http://localhost:8000',
	},
};

const prod = {
	url: {
		HOST: '',
		PORT: '',
	},
};

const apiUrl = {
	API_URL_LOGIN: '/api/user/token/',
	API_URL_AGENCIES: '/api/sale/agencies/',
	API_URL_ALL_AGENCIES: '/api/sale/agencies/all',
	API_URL_WAREHOUSES: '/api/sale/warehouses/',
	API_URL_CATEGORIES: '/api/sale/categories/',
	API_URL_ALL_CATEGORIES: '/api/sale/categories/all',
	API_URL_BATCHES: '/api/sale/batches/',
	API_URL_ALL_BATCHES: '/api/sale/batches/all',
	API_URL_PRODUCTS: '/api/sale/products/',
	API_URL_PRODUCT_STOCKS: '/api/sale/product-stocks/',
	API_URL_SUPPLIERS: '/api/sale/suppliers/',
	API_URL_ALL_SUPPLIERS: '/api/sale/suppliers/all',
	API_URL_ENTRIES: '/api/sale/entries/',
	API_URL_OUTPUTS: '/api/sale/outputs/',
	API_URL_CLIENTS: '/api/sale/clients/',
	API_URL_ALL_CLIENTS: '/api/sale/clients/all',
	API_URL_CLIENT_CHOICES: '/api/sale/clients/choices/',
	API_URL_CITY_CHOICES: '/api/sale/agencies/choices/',
	API_URL_PRODUCT_CHANNEL: '/api/sale/product-channel-prices/',
	API_URL_SELLING_CHANNEL: '/api/sale/selling-channels/',
	API_URL_ALL_SELLING_CHANNEL: '/api/sale/selling-channels/all',
	API_URL_PURCHASES: '/api/sale/purchases/',
	API_URL_SALES: '/api/sale/sales/',
	API_URL_PAYMENTS: '/api/sale/payments/',
	API_URL_CATALOG: '/api/sale/catalog',
	PROFORMA_PDF_URL: '/api/sale/proforma-pdf/',
	OUTPUT_PDF_URL: '/api/sale/output-pdf/',
};

export const config = import.meta.env.MODE === 'development' ? dev : prod;
export const api = apiUrl;
