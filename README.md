# ElderMate

QR safety tags. Anyone can scan a tag and alert the household; the scanner never learns who is connected.

## Run locally
```bash
cp .env.example .env
docker compose up -d db
npm install
npx prisma migrate dev
npm run dev
```
Sign in at `/login` with a phone in international format. OTP codes and alerts are printed to the server console (`[otp]`, `[notify]`).

## How privacy works
- QR encodes `/t/<random 128-bit token>` only. The DB stores a SHA-256 hash of it.
- The scan page and `/api/alert` never load or return contacts or owner data.
- Unknown, disabled and rate-limited tokens all get the same response.
- Alerts fire on button tap (POST), never on page load, so link-preview bots can't trigger them.

## Adding SMS / WhatsApp
Implement `Notifier` in `lib/notifier.ts` and select it with the `NOTIFIER` env var.

## Tests
`npm test`

## Token encryption key
Tags keep an AES-256-GCM encrypted copy of their token so owners can re-download the QR. Set `TOKEN_ENC_KEY` (`openssl rand -base64 32`) and never lose it: without it saved QRs can't be shown and tags must be re-issued.
