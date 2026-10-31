# ActVerse 🎬

**ActVerse** is a fan-powered acting challenge platform where fans submit dialogue challenges, influencers perform accepted challenges, and the community votes on the performances.

- **Live website:** https://act-verse.vercel.app/
- **Backend API:** https://actverse-backend.onrender.com
- **GitHub repository:** https://github.com/RojaShree03/ActVerse

## About the Project

ActVerse connects fans and performers through acting challenges. Fans can submit dialogues with a secret emotion, an approved influencer can accept a challenge and publish an Instagram performance link, and visitors can reveal the emotion and vote **PASS** or **FAIL**.

The application is built using the MERN stack.

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- Nodemailer for email OTP

### Deployment
- Vercel – frontend hosting
- Render – backend hosting
- MongoDB Atlas – cloud database

## Main Features

### Public Visitors
- Browse available and completed challenges.
- View published Instagram performance links.
- Reveal a challenge's secret emotion using its reveal password.
- Vote PASS or FAIL after revealing the emotion.

### Fan Account
- Register with email OTP verification.
- Log in to the platform.
- Submit dialogue challenges.
- Select a secret emotion and configure a reveal password.
- View personal challenge submissions.

### Influencer Account
- Apply for an influencer account.
- Wait for administrator approval.
- Browse available challenges after approval.
- Accept an available challenge.
- Publish the Instagram URL for the accepted challenge.

### Administrator
- Review pending influencer applications.
- Approve or reject influencer applications.
- View and manage platform challenges.
- Monitor platform activity and voting.

## Challenge Workflow

1. A fan registers and verifies their email address.
2. The fan submits a dialogue, selects an emotion, and sets a reveal password.
3. The challenge becomes available for an approved influencer.
4. An approved influencer accepts the challenge.
5. The influencer performs the dialogue and publishes the performance on Instagram.
6. The influencer adds the Instagram URL to the challenge in ActVerse.
7. Visitors enter the reveal password to view the secret emotion.
8. Visitors vote PASS or FAIL.

> The platform stores a hashed reveal password. The reveal password should be shared separately with the intended audience. Performance videos are hosted on Instagram; ActVerse stores the external link.

## Project Structure

```text
ActVerse/
├── client/                 # React + Vite frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

*Some filenames may differ depending on the current project version.*

## Requirements

- Node.js (LTS version recommended)
- npm
- MongoDB local installation or a MongoDB Atlas account
- Git

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/RojaShree03/ActVerse.git
cd ActVerse
```

### 2. Install dependencies

From the project root:

```bash
npm run install:all
```

If the root install script is not available in your checkout, install each application separately:

```bash
cd server
npm install
cd ../client
npm install
cd ..
```

### 3. Configure backend environment variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_ORIGIN=http://localhost:5173

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=RojaShree

RULES_VERSION=1.0

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password

OTP_EXPIRY_MINUTES=10
```

Replace the example values with your own configuration. For Gmail SMTP, use a **Google App Password** where required, not your normal Gmail account password.

### 4. Configure frontend environment variables

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000
```

The frontend should use this variable as its backend API base URL.

### 5. Start the application

From the project root, if the root development script is configured:

```bash
npm run dev
```

Otherwise, start the backend and frontend in two separate terminals.

**Terminal 1 – Backend**

```bash
cd server
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd client
npm run dev
```

Open the Vite development URL shown in the terminal, usually `http://localhost:5173`.

## Production Environment

| Component | Hosting |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

### Render backend environment variables

Configure these in Render's environment-variable settings. Do not commit real secrets to GitHub.

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_ORIGIN=https://act-verse.vercel.app

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=RojaShree

RULES_VERSION=1.0

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password

OTP_EXPIRY_MINUTES=10
```

### Vercel frontend environment variable

```env
VITE_API_URL=https://actverse-backend.onrender.com
```

After changing frontend environment variables in Vercel, redeploy the frontend so the new values are included in the build.

> Render free web services may spin down after inactivity. The first request after a period of inactivity can take longer to respond.

## Security Notes

- Never upload `.env` files, database credentials, JWT secrets, or email app passwords to GitHub.
- Use strong passwords for MongoDB database users and administrator accounts.
- Use a unique, long `JWT_SECRET`.
- Restrict MongoDB Atlas network access as appropriate for your deployment.
- Keep dependencies updated and review security advisories.
- Do not share private challenge reveal passwords publicly unless intended.

## Testing Checklist

- [ ] Open the live website.
- [ ] Register a fan account.
- [ ] Receive and verify the email OTP.
- [ ] Log in successfully.
- [ ] Submit a dialogue challenge.
- [ ] Apply for an influencer account.
- [ ] Approve the influencer account as administrator.
- [ ] Accept an available challenge as the approved influencer.
- [ ] Publish an Instagram performance URL.
- [ ] Reveal the challenge emotion using the reveal password.
- [ ] Submit PASS or FAIL votes.
- [ ] Check the dashboard and leaderboard.

## Project Links

- **Website:** https://act-verse.vercel.app/
- **Backend:** https://actverse-backend.onrender.com
- **GitHub:** https://github.com/RojaShree03/ActVerse

## Project Creator

**Created by:** RojaShree

---

⭐ If you find this project useful, consider giving the repository a star on GitHub.
