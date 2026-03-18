# Template de email - Reset de senha (Supabase)

## Design system extraído

| Elemento | Valor |
|----------|-------|
| **Background** | Gradiente azul (#2E8EE6 → #34A1F6) |
| **Card** | Branco (#FFFFFF), bordas arredondadas 12px |
| **Header** | Gradiente (#1E88E5 → #4FC3F7) |
| **Azul primário** | #1E88E5 |
| **Título** | #333333, 22-24px, bold |
| **Texto** | #666666, 15-16px |
| **Texto secundário** | #9E9E9E, 12px |
| **Botão** | #1E88E5, texto branco, border-radius 8px |

---

## Como aplicar no Supabase

1. Acesse **Supabase Dashboard** → **Authentication** → **Email** → **Email Templates**
2. Selecione o template **"Reset password"**
3. **Subject:** `Redefinir senha - Editai`
4. **Body:** Cole o HTML abaixo (versão simples, melhor compatibilidade)

---

## HTML para o Body (copie e cole)

```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden;">
  <tr>
    <td style="background: #1E88E5; padding: 24px; text-align: center;">
      <span style="font-size: 22px; font-weight: 700; color: #FFFFFF;">Editai</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 32px 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom: 20px;">
            <span style="font-size: 36px;">🔐</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 16px;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700; color: #333333;">Redefinir senha</h2>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #666666;">Olá, clique no botão abaixo para redefinir sua senha.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 24px;">
            <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 36px; background: #1E88E5; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">Redefinir senha</a>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="margin: 0; font-size: 12px; color: #9E9E9E;">Precisa de ajuda? Acesse <a href="https://app.editai.online/suporte" style="color: #1E88E5;">app.editai.online/suporte</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

---

## Variáveis do Supabase usadas

| Variável | Uso |
|----------|-----|
| `{{ .ConfirmationURL }}` | Link do botão "Redefinir senha" (obrigatório) |
| `{{ .SiteURL }}` | URL do site para link de suporte |
| `{{ .Email }}` | Email do usuário (disponível para personalização) |

---

## Arquivos gerados

- `supabase-email-reset-password.html` — Versão completa com wrapper
- `supabase-email-reset-password-simple.html` — Versão para colar no Supabase
- `SUPABASE_EMAIL_TEMPLATE_README.md` — Este guia
