# Responsive and Chart Testing

## Run the app

```bash
npm install
npx expo start -c
```

Open the app on an Android emulator or a physical Android phone, then login with:

- Email: `adit@mail.com`
- Password: `123456`

Open `Plant Testing`, then check the overview screen.

## Android sizes to test

- Small phone / Oppo F7 class: around `360dp` wide.
- Common emulator: around `390dp` wide.
- Medium Android: around `412dp` wide.
- Large Android: around `430dp` wide.
- Tall aspect ratio devices.

## Responsive checklist

- Header is not cut off.
- PV bubble is horizontally aligned with Grid.
- Battery bubble is horizontally aligned with Load.
- Battery and Load bubbles do not overlap.
- Bubbles stay around the house image and do not leave the screen.
- PowerFlowDiagram icons, labels, and values stay inside the card.
- Chart stays inside the screen width.
- Bottom tab remains aligned and visible.

## Optional layout debug

For local development only, set this in `.env`:

```env
EXPO_PUBLIC_DEBUG_LAYOUT=true
```

The overview screen logs the current screen width and chart width to the console. Do not enable this for production builds.

## Chart endpoint manual test

Login first, copy the returned token, then test the chart endpoint.

```bash
curl -X POST "http://103.31.205.39:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"adit@mail.com\",\"password\":\"123456\"}"
```

```bash
curl "http://103.31.205.39:3000/api/data/chart?plantId=1&segment=day&date=2026-05-07" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

```bash
curl "http://103.31.205.39:3000/api/data/chart?plantId=1&segment=day&date=2026-05-06" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <token>"
```

## Optional chart debug

For local development only, set this in `.env`:

```env
EXPO_PUBLIC_DEBUG_CHART=true
```

The app logs the chart URL, plantId, segment, date, response status, and point counts per series. Tokens and passwords are not logged.

## SQL checks on the VPS database

Use these on the VPS PostgreSQL database to confirm the data that the chart endpoint can query:

```sql
SELECT DISTINCT category, type
FROM device_data
ORDER BY category, type;
```

```sql
SELECT *
FROM device_data
ORDER BY created_at DESC
LIMIT 20;
```

```sql
SELECT *
FROM device_data
WHERE created_at::date = '2026-05-07'
ORDER BY created_at DESC
LIMIT 50;
```

If the chart endpoint returns empty data for a selected day, also check the previous day because UTC timestamps may place Asia/Jakarta readings on a different stored date.
