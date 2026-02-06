
import nodemailer from 'nodemailer'

// Gmail SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  // If no credentials, log and skip (dev mode safety)
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
    console.warn("[EMAIL] No Gmail credentials found. Skipping email to:", to)
    return
  }

  try {
    const info = await transporter.sendMail({
      from: `"Survey Admin" <${process.env.GMAIL_EMAIL}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // Strip HTML tags if no text provided
      html,
    })

    console.log(`[EMAIL] Sent to ${to}, MsgId: ${info.messageId}`)
    return info
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}:`, error)
    // Don't throw, just log. We don't want to crash the whole publish process if one email fails.
  }
}

export async function sendSurveyInvite(
  recipientEmail: string,
  surveyTitle: string,
  role: string, // SELF, PEER, MANAGER, SUBORDINATE
  participantName?: string, // Name of person being evaluated (if not self)
  customSubject?: string,
  customBody?: string
) {
  const isSelf = role === 'SELF'

  // Use custom subject if provided, otherwise use default
  const subject = customSubject || (isSelf
    ? `Action Required: Self-Evaluation for ${surveyTitle}`
    : `Feedback Request: Evaluate ${participantName} for ${surveyTitle}`)

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/surveys`

  // Use custom body if provided, otherwise use default
  let htmlBody: string
  if (customBody) {
    // If custom body is provided, wrap it in HTML template and add the button
    htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1e3a5f;">${surveyTitle}</h2>
          <div style="white-space: pre-wrap;">${customBody}</div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${dashboardUrl}" style="background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Survey Dashboard
            </a>
          </div>

          <p style="font-size: 12px; color: #666;">
            If you cannot click the button, please visit: ${dashboardUrl}
          </p>
        </div>
      </body>
    </html>
    `
  } else {
    // Default template
    const actionText = isSelf
      ? "You have been assigned a self-evaluation."
      : `You have been selected to provide feedback for <strong>${participantName}</strong>.`

    htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1e3a5f;">${surveyTitle}</h2>
          <p>Hello,</p>
          <p>${actionText}</p>
          <p>Your feedback is crucial for our professional development process.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${dashboardUrl}" style="background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Go to Survey Dashboard
            </a>
          </div>

          <p style="font-size: 12px; color: #666;">
            If you cannot click the button, please visit: ${dashboardUrl}
          </p>
        </div>
      </body>
    </html>
    `
  }

  return sendEmail({
    to: recipientEmail,
    subject,
    html: htmlBody
  })
}

/**
 * Send survey reminder email
 */
export async function sendSurveyReminder(
  recipientEmail: string,
  recipientName: string,
  surveyTitle: string,
  surveyId: string,
  daysRemaining: number,
  endDate: string,
  customSubject?: string,
  customBody?: string
) {
  // Replace [X] placeholder with actual days remaining in subject and body
  const processedSubject = (customSubject || `Reminder: Complete "${surveyTitle}" - ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''} Remaining`)
    .replace(/\[X\]/g, daysRemaining.toString());

  const processedBody = customBody?.replace(/\[X\]/g, daysRemaining.toString());

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/surveys`

  const htmlBody = generateReminderEmailHTML({
    recipientName,
    surveyTitle,
    surveyLink: dashboardUrl,
    daysRemaining,
    endDate,
    customBody: processedBody
  })

  return sendEmail({
    to: recipientEmail,
    subject: processedSubject,
    html: htmlBody
  })
}

/**
 * Generate reminder email HTML template
 */
function generateReminderEmailHTML(params: {
  recipientName: string
  surveyTitle: string
  surveyLink: string
  daysRemaining: number
  endDate: string
  customBody?: string
}): string {
  const { recipientName, surveyTitle, surveyLink, daysRemaining, endDate, customBody } = params

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e3a5f 0%, #2c5aa0 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .alert-box strong { color: #856404; }
        .alert-danger { background: #f8d7da; border-left-color: #dc3545; }
        .alert-danger strong { color: #721c24; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .details-item { margin: 10px 0; }
        .details-item strong { color: #1e3a5f; }
        .cta-button { display: inline-block; background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; text-align: center; }
        .cta-button:hover { background: #2c5aa0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Survey Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          
          ${daysRemaining > 0
      ? `<div class="alert-box">
                <strong>⏰ You have ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining</strong> to complete this survey!
              </div>`
      : `<div class="alert-box alert-danger">
                <strong>⚠️ Last day to complete this survey!</strong>
              </div>`
    }
          
          ${customBody ? `<div style="white-space: pre-wrap;">${customBody}</div>` : `
            <p>This is a friendly reminder to complete the survey: <strong>"${surveyTitle}"</strong>.</p>
            <p>Your feedback is valuable and helps us improve. Please take a moment to share your thoughts.</p>
          `}
          
          <div class="details">
            <div class="details-item"><strong>Survey:</strong> ${surveyTitle}</div>
            <div class="details-item"><strong>Deadline:</strong> ${endDate}</div>
            <div class="details-item"><strong>Time Remaining:</strong> ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</div>
          </div>
          
          <center>
            <a href="${surveyLink}" class="cta-button">Complete Survey Now →</a>
          </center>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you have already completed this survey, please disregard this reminder.
          </p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from the Survey System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Calculate days remaining until end date
 */
export function calculateDaysRemaining(endDate: Date): number {
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

