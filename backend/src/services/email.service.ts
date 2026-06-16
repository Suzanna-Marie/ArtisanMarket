import axios from 'axios'

const brevo = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
})

const FROM = {
  name: 'ArtisanMarket',
  email: process.env.FROM_EMAIL || 'noreply@artisanmarket.bj',
}

const envoyerEmail = async (to: string, subject: string, htmlContent: string) => {
  await brevo.post('/smtp/email', {
    sender: FROM,
    to: [{ email: to }],
    subject,
    htmlContent,
  })
}

const emailBase = (contenu: string) => `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F0;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0;">
<tr><td style="background-color:#2D5016;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;"><span style="color:#E8B84B;">Artisan</span>Market</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">La plateforme de l'artisanat béninois</p>
</td></tr>
<tr><td style="padding:40px;">${contenu}</td></tr>
<tr><td style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d0;">
  <p style="margin:0;color:#aaa;font-size:12px;">© 2026 ArtisanMarket · Plateforme de l'artisanat du Bénin</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`

export const envoyerEmailValidationArtisan = async (email: string, prenom: string, nomBoutique: string) => {
  await envoyerEmail(email, '✅ Votre boutique ArtisanMarket est validée !', emailBase(`
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;margin:0 0 24px;line-height:1.6;">
      Bonne nouvelle ! Votre boutique <strong>${nomBoutique}</strong> a été validée par notre équipe.
      Vous pouvez dès maintenant publier vos produits et commencer à vendre sur ArtisanMarket.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;background:#d5e8d4;border:2px solid #2D5016;border-radius:12px;padding:16px 32px;">
        <p style="margin:0;font-size:32px;">🎉</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:bold;color:#2D5016;">Boutique approuvée !</p>
      </div>
    </div>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
      Connectez-vous à votre espace artisan pour commencer à publier vos créations.
    </p>
  `))
}

export const envoyerEmailRejetArtisan = async (email: string, prenom: string, nomBoutique: string, motif?: string) => {
  await envoyerEmail(email, "Votre demande d'inscription ArtisanMarket", emailBase(`
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;margin:0 0 24px;line-height:1.6;">
      Après examen de votre dossier, votre demande d'inscription pour la boutique
      <strong>${nomBoutique}</strong> n'a pas pu être approuvée.
    </p>
    ${motif ? `
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin:0 0 24px;">
      <p style="margin:0;font-size:14px;color:#856404;"><strong>Motif :</strong> ${motif}</p>
    </div>` : ''}
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
      Vous pouvez corriger les points mentionnés et soumettre une nouvelle demande d'inscription.
      Pour toute question, contactez notre équipe.
    </p>
  `))
}

export const envoyerEmailSuspensionArtisan = async (email: string, prenom: string, nomBoutique: string) => {
  await envoyerEmail(email, 'Votre boutique ArtisanMarket a été suspendue', emailBase(`
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;margin:0 0 24px;line-height:1.6;">
      Votre boutique <strong>${nomBoutique}</strong> a été temporairement suspendue par notre équipe d'administration.
      Vos produits ne sont plus visibles sur la plateforme pendant cette période.
    </p>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
      Pour plus d'informations ou pour contester cette décision, contactez notre équipe de support.
    </p>
  `))
}

export const envoyerCodeReinitialisation = async (email: string, prenom: string, code: string) => {
  await envoyerEmail(email, `${code} - Réinitialisation de votre mot de passe ArtisanMarket`, `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F0;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0;">
<tr><td style="background-color:#2D5016;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;"><span style="color:#E8B84B;">Artisan</span>Market</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">La plateforme de l'artisanat béninois</p>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#555;font-size:15px;margin:0 0 32px;line-height:1.6;">
    Vous avez demandé à réinitialiser votre mot de passe sur <strong>ArtisanMarket</strong>.
    Utilisez le code ci-dessous pour créer un nouveau mot de passe.
  </p>
  <div style="text-align:center;margin:0 0 32px;">
    <div style="display:inline-block;background:#FAF7F0;border:2px solid #8B6914;border-radius:12px;padding:20px 40px;">
      <p style="margin:0;font-size:40px;font-weight:bold;letter-spacing:12px;color:#8B6914;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:12px 0 0;color:#888;font-size:13px;">Ce code est valable pendant <strong>15 minutes</strong>.</p>
  </div>
  <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
  </p>
</td></tr>
<tr><td style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d0;">
  <p style="margin:0;color:#aaa;font-size:12px;">© 2026 ArtisanMarket · Plateforme de l'artisanat du Bénin</p>
</td></tr>
</table></td></tr></table>
</body></html>`)
}

export const envoyerEmailContact = async (nom: string, email: string, sujet: string, message: string) => {
  await envoyerEmail(
    process.env.FROM_EMAIL || '',
    `[Contact] ${sujet || 'Nouveau message'} — ${nom}`,
    emailBase(`
      <p style="color:#1A1A1A;font-size:16px;margin:0 0 16px;">Nouveau message via le formulaire de contact</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe0;font-size:13px;color:#888;width:100px;">Nom</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;font-size:14px;color:#1A1A1A;font-weight:600;">${nom}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe0;font-size:13px;color:#888;">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0ebe0;font-size:14px;color:#2D5016;">${email}</td></tr>
        <tr><td style="padding:8px 0;font-size:13px;color:#888;">Sujet</td>
            <td style="padding:8px 0;font-size:14px;color:#1A1A1A;">${sujet || 'Non précisé'}</td></tr>
      </table>
      <div style="background:#FAF7F0;border-left:3px solid #2D5016;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
      </div>
      <p style="color:#888;font-size:12px;margin:0;">
        Répondez directement à cet email pour contacter <strong>${nom}</strong>.
      </p>
    `)
  )
}

export const envoyerEmailContact_confirmation = async (nom: string, email: string) => {
  await envoyerEmail(email, 'Votre message a bien été reçu — ArtisanMarket', emailBase(`
    <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${nom}</strong>,</p>
    <p style="color:#555;font-size:15px;margin:0 0 24px;line-height:1.6;">
      Nous avons bien reçu votre message et nous vous répondrons dans les <strong>24 heures</strong>.
    </p>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
      Merci de faire confiance à ArtisanMarket — la plateforme de l'artisanat béninois.
    </p>
  `))
}

export const envoyerCodeVerification = async (email: string, prenom: string, code: string) => {
  await envoyerEmail(email, `${code} - Votre code de vérification ArtisanMarket`, `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF7F0;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0;">
<tr><td style="background-color:#2D5016;padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;"><span style="color:#E8B84B;">Artisan</span>Market</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">La plateforme de l'artisanat béninois</p>
</td></tr>
<tr><td style="padding:40px;">
  <p style="color:#1A1A1A;font-size:16px;margin:0 0 8px;">Bonjour <strong>${prenom}</strong>,</p>
  <p style="color:#555;font-size:15px;margin:0 0 32px;line-height:1.6;">
    Merci pour votre inscription sur <strong>ArtisanMarket</strong> !
    Pour activer votre compte, entrez le code ci-dessous dans l'application.
  </p>
  <div style="text-align:center;margin:0 0 32px;">
    <div style="display:inline-block;background:#FAF7F0;border:2px solid #8B6914;border-radius:12px;padding:20px 40px;">
      <p style="margin:0;font-size:40px;font-weight:bold;letter-spacing:12px;color:#8B6914;font-family:monospace;">${code}</p>
    </div>
    <p style="margin:12px 0 0;color:#888;font-size:13px;">Ce code est valable pendant <strong>15 minutes</strong>.</p>
  </div>
  <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
    Si vous n'avez pas créé de compte sur ArtisanMarket, ignorez simplement cet email.
  </p>
</td></tr>
<tr><td style="background:#f5f0e8;padding:20px 40px;text-align:center;border-top:1px solid #e8e0d0;">
  <p style="margin:0;color:#aaa;font-size:12px;">© 2026 ArtisanMarket · Plateforme de l'artisanat du Bénin</p>
</td></tr>
</table></td></tr></table>
</body></html>`)
}
