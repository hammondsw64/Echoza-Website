# Echoza Website

A starter website for music artists to upload songs and preview them in a simple dashboard.

## Features

- Upload audio files (MP3, WAV, FLAC, AAC, OGG, M4A)
- 25MB max file size per upload
- Automatically lists uploaded songs
- In-browser audio playback

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

- `POST /api/upload` with `multipart/form-data` and `song` file field
- `GET /api/songs` to list uploaded files
