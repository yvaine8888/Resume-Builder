# Resume-Builder

## Development

Install dependencies, then start the frontend and API in separate terminals:

```sh
npm install
npm run dev
npm run dev:api
```

The Vite development server proxies `/api` requests to the Express server on port `3001`. Check the API at [http://localhost:3001/api/health](http://localhost:3001/api/health); it responds with `{"status":"ok"}`. You can also request `/api/health` through the Vite server.