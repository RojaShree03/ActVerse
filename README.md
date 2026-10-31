# ActVerse — MERN Challenge Platform

ActVerse is a bilingual (English/Tamil) fan-powered dialogue and acting challenge platform built with React + Vite, Node.js, Express and MongoDB.

## Included
- Public home, challenge dashboard, rules, leaderboard and creator portfolio
- Vijay Surya portfolio profile image and Instagram / YouTube / Facebook links
- Registered users can submit dialogue challenges and choose a private emotion
- Admin (seeded from environment) activates submissions and publishes Instagram post links with access codes
- Public visitors can unlock a challenge with its code to reveal the emotion and Instagram link
- Public PASS / FAIL voting; one vote per browser identity per challenge
- Admin overview and moderation queue
- Email OTP for both registration and login through Gmail SMTP
- English/Tamil UI dictionaries and responsive black + muted-red theme
- Five-day challenge expiry and automatic deletion of challenge/vote records; score summaries and accounts persist

## Requirements
Node.js 20+, npm, MongoDB (local or Atlas), and Gmail SMTP App Password.

## Local setup
1. Extract the ZIP and open the `ActVerse` folder.
2. Run `npm run install:all`.
3. Copy `server/.env.example` to `server/.env`.
4. Set `MONGODB_URI`, a long random `JWT_SECRET`, admin credentials, and Gmail SMTP settings.
5. Start both apps with `npm run dev`.
6. Open http://localhost:5173.

## Gmail OTP setup
- Use the configured Gmail account `middleclassvijaysurya13@gmail.com` as `SMTP_USER`.
- Enable 2-Step Verification on that Google account and generate a Google App Password.
- Put the 16-character App Password in `SMTP_PASS`. Do not use the normal Gmail password and do not commit `.env`.
- OTPs expire after 10 minutes by default and are limited to five verification attempts.

## Admin setup
Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME=RojaShree` in `server/.env`. The server creates the admin account on first startup if it does not exist. Use a strong unique password. Public registration never grants the admin role.

## Access model
- Public: browse the dashboard, view published challenges, unlock with challenge code, see leaderboard, vote PASS/FAIL, view portfolio and rules.
- Account required: register/login (both OTP verified), accept current rules, submit a dialogue challenge, see personal submissions.
- Admin: manage pending submissions, activate challenges, publish Instagram URLs and access codes, view overview statistics.

## Challenge retention
The activation clock is five days, matching the supplied server implementation and current rules page. When expired, challenge and associated vote records are deleted by the hourly cleanup job. Accounts and cumulative score summaries remain. Change this duration only after confirming the product requirement and updating the rules text together.

## Notes / production checklist
- Instagram/YouTube URLs are external links; this project does not upload or host video files.
- Anonymous vote uniqueness is browser-based; clearing browser storage or using another browser/device can create another voting identity. For stronger anti-abuse protection, add CAPTCHA and server-side rate controls.
- Set production `CLIENT_ORIGIN`, HTTPS, strong secrets, backups, monitoring and database access controls before public launch.
- The translation preview endpoint remains an unconfigured 501 placeholder.
- Review Terms, Privacy Policy, retention wording and consent before launch.
