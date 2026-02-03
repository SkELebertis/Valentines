# Valentine Showoff

A playful, animated "Will you be my Valentine?" site with a frontend built in HTML/CSS/JS and an optional Node/Express backend to send the response via email.

## Features
- Animated hero with hearts and confetti
- Modal prompt asking "Will you be my Valentine?" with Yes/No buttons
- Secret message input and reveal animation
- Sends your answer to a configured email address via backend (Nodemailer).
- Responsive layout and accessible interactions

## Setup
1. Install dependencies:

```bash
cd server
npm install

# from project root (optional)
npm install
```

2. Create a `.env` file inside `server/` with SMTP credentials:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
TO_EMAIL=salvadorralphrussel@gmail.com
```

Tip: `TO_EMAIL` is set to your provided email in the example above; change it if you want answers to go to a different address.

3. Run dev servers:

```bash
npm run dev
```

This runs the frontend via live-server and the backend via nodemon concurrently.

## Notes
- Replace placeholder images and message text with personalized content.
- For production, secure your SMTP credentials and consider using a transactional email service.
