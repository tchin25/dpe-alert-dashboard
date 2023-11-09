# Data Engineering Alerts Dashboard

## Generate data to json file

1. Make a `.env` file and fill in details:
```
EMAIL_USERNAME=
EMAIL_PASSWORD=
```

2. Modify `src/index.ts` to not scan through all the pages (the json file will be too large)

3. 
```bash
npm run build
node dist/index.js
```

4. Move the `data.json` file into `alerts-dashboard/server/api` to be used by the backend.

## Run dashboard locally

```bash
cd alerts-dashboard
yarn dev
```

## Generate data into MariaDB

1. Add this to `.env` file and fill it in:
```
SQL_DATABASE=
SQL_USER=
SQL_PASSWORD=
SQL_HOST=
SQL_PORT=
```

TODO

## Deploy on Toolforge

TODO
