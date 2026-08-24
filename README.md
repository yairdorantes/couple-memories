# Couple Memories

React PWA frontend with a Django REST backend for couple profiles, memories, places, notes, and Cloudinary-backed media.

## Structure

```txt
.
├── frontend/             # React PWA frontend
│   ├── src/
│   └── public/
├── backend/              # Django backend
│   ├── apps/
│   │   ├── accounts/
│   │   ├── couples/
│   │   ├── mediafiles/
│   │   └── memories/
│   └── config/
├── docker-compose.yml
└── .env.example
```

## Backend Setup

Create a local `.env` from `.env.example` and fill in real values. Do not commit `.env`.

For the frontend API connection:

```txt
VITE_API_BASE_URL=http://localhost:8005/api
```

For Railway PostgreSQL:

```txt
POSTGRES_DB=railway
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<railway-password>
POSTGRES_HOST=<railway-host>
POSTGRES_PORT=<railway-port>
```

For Cloudinary:

```txt
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

Run locally with Docker:

```bash
docker compose up --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

The API runs on `http://localhost:8005/api/`.

## Frontend Setup

Run frontend commands from the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173/`.

The frontend still reads Vite environment variables from the repo-root `.env` file.

## API Resources

- `POST /api/auth/token/` obtains a DRF token.
- `/api/couples/` manages couples visible to the authenticated user.
- `/api/couple-members/` updates Her/Him profile data and notes.
- `/api/memories/` supports timeline/grid/calendar data, search, category filters, favorites, and CRUD.
- `/api/places/` supports map markers and visited places.
- `/api/media/` uploads image files to Cloudinary and stores delivery metadata.

Use `Authorization: Token <token>` for authenticated API requests.

## Backend Checks

```bash
cd backend
pip install -r requirements/development.txt
python manage.py makemigrations --check --dry-run
python manage.py test --settings=config.settings.test
```

## Frontend Checks

```bash
cd frontend
npm run lint
npm run build
```
