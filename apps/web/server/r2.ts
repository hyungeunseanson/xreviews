import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AllowedEvidenceFileType } from "@xreviews/validators";

const SIGNED_UPLOAD_EXPIRES_IN_SECONDS = 5 * 60;
const SIGNED_READ_EXPIRES_IN_SECONDS = 3 * 60;

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

export class R2ConfigurationError extends Error {
  constructor() {
    super("Cloudflare R2 environment variables are required for evidence upload.");
  }
}

export function isR2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim()
  );
}

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new R2ConfigurationError();
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName
  };
}

function getR2Client(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    },
    forcePathStyle: true
  });
}

export function sanitizeEvidenceFileName(fileName: string) {
  const [name = "evidence", extension = ""] = fileName
    .normalize("NFKC")
    .trim()
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .split(/(?=\.[^.]+$)/);

  const safeName = name.slice(0, 80) || "evidence";
  const safeExtension = extension.slice(0, 20);

  return `${safeName}${safeExtension}`;
}

export function createEvidenceObjectKey(input: {
  userId: string;
  fileName: string;
}) {
  return `evidence/${input.userId}/${crypto.randomUUID()}-${sanitizeEvidenceFileName(
    input.fileName
  )}`;
}

export async function createEvidenceUploadUrl(input: {
  objectKey: string;
  fileType: AllowedEvidenceFileType;
}) {
  const config = getR2Config();
  const client = getR2Client(config);
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: input.objectKey,
    ContentType: input.fileType
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: SIGNED_UPLOAD_EXPIRES_IN_SECONDS
  });

  return {
    uploadUrl,
    expiresInSeconds: SIGNED_UPLOAD_EXPIRES_IN_SECONDS
  };
}

export async function createEvidenceReadUrl(input: {
  objectKey: string;
  fileName?: string;
}) {
  const config = getR2Config();
  const client = getR2Client(config);
  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: input.objectKey,
    ResponseContentDisposition: input.fileName
      ? `inline; filename="${sanitizeEvidenceFileName(input.fileName)}"`
      : undefined
  });

  const readUrl = await getSignedUrl(client, command, {
    expiresIn: SIGNED_READ_EXPIRES_IN_SECONDS
  });

  return {
    readUrl,
    expiresInSeconds: SIGNED_READ_EXPIRES_IN_SECONDS
  };
}
