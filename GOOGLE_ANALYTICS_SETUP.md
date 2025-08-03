# Google Analytics Setup Guide

This guide will help you set up Google Analytics 4 (GA4) for your Math Assessment Diagnostic Tool.

## Prerequisites

1. A Google account
2. Access to Google Analytics

## Step 1: Create a Google Analytics Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Create Property"
3. Follow the setup wizard:
   - Enter your property name (e.g., "Math Assessment Diagnostic Tool")
   - Select your reporting time zone
   - Choose your industry category
   - Select your business objectives
4. Create a data stream for your website:
   - Choose "Web" as the platform
   - Enter your website URL
   - Give your stream a name (e.g., "Math Assessment Tool")
5. Copy your **Measurement ID** (starts with "G-")

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Google Analytics Measurement ID:

```bash
# Google Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## Step 3: Verify Installation

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open your browser's Developer Tools (F12)
3. Go to the Network tab
4. Navigate to your website
5. Look for requests to `googletagmanager.com` - this confirms GA is working

## Step 4: Test Events

The application includes several pre-configured events:

### User Events

- `login` - When users log in
- `register` - When users register
- `logout` - When users log out
- `role_select` - When users select their role (teacher/student)

### Quiz Events

- `quiz_start` - When a quiz begins
- `quiz_complete` - When a quiz is completed
- `question_answer` - When a question is answered
- `copy_assessment_link` - When assessment link is copied
- `copy_quiz_code` - When quiz code is copied

### Page Views

- All page views are automatically tracked
- Custom parameters include page title and URL

## Step 5: View Analytics Data

1. Go to your Google Analytics dashboard
2. Navigate to **Reports** → **Realtime** to see live data
3. Check **Events** to see custom event tracking
4. View **Pages and screens** to see page view data

## Custom Event Tracking

You can add custom event tracking anywhere in your code:

```typescript
import {
  trackEvent,
  trackQuizEvent,
  trackUserAction
} from "@/components/GoogleAnalytics"

// Track a custom event
trackEvent("button_click", "ui", "submit_button")

// Track quiz events
trackQuizEvent("quiz_start", "quiz-123")

// Track user actions
trackUserAction("login", "teacher")
```

## Environment Variables

| Variable                        | Description             | Example        |
| ------------------------------- | ----------------------- | -------------- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Your GA4 Measurement ID | `G-ABC123DEF4` |

## Troubleshooting

### GA not loading

- Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
- Verify the Measurement ID starts with "G-"
- Check browser console for errors

### Events not showing

- Wait 24-48 hours for data to appear in GA
- Check the Network tab for successful requests to Google
- Verify events are being triggered in your code

### Development vs Production

- GA works in both development and production
- Use different Measurement IDs for dev/prod if needed
- Test in production for most accurate results

## Privacy Considerations

- GA respects user privacy settings
- No personally identifiable information is sent
- Consider adding a privacy policy for your users
- Implement cookie consent if required by your jurisdiction

## Additional Configuration

For advanced configuration, you can modify the `GoogleAnalytics.tsx` component:

- Add custom dimensions
- Configure enhanced ecommerce tracking
- Set up conversion goals
- Add user ID tracking (if you have user accounts)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your Measurement ID is correct
3. Test with Google Analytics Debugger extension
4. Check the Network tab for failed requests
