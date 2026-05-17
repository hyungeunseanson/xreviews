import { Resend } from "resend";

type MagicLinkEmailInput = {
  to: string;
  url: string;
};

const isProduction = process.env.NODE_ENV === "production";

function getRequiredEnv(name: "RESEND_API_KEY" | "RESEND_FROM_EMAIL") {
  const value = process.env[name]?.trim();

  if (isProduction && !value) {
    throw new Error(`${name} is required in production.`);
  }

  return value;
}

export async function sendMagicLinkEmail({ to, url }: MagicLinkEmailInput) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");

  const subject = "Xreviews 로그인 링크";
  const text = [
    "Xreviews 로그인 링크입니다.",
    "",
    "가기 전 확인하고, 겪은 뒤 남기세요.",
    "",
    url,
    "",
    "이 링크를 요청하지 않았다면 이 메일을 무시해도 됩니다."
  ].join("\n");

  if (!apiKey || !from) {
    console.info("[Xreviews auth email mock]", { to, subject, url });
    return { mocked: true };
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    text
  });

  if (error) {
    throw new Error(`Failed to send magic link email: ${error.message}`);
  }

  return { mocked: false };
}
