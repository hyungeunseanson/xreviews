import { config as loadEnv } from "dotenv";
import { createDb } from "./client";
import {
  riskTags,
  subjectCategories,
  subjectCategoryRiskTags
} from "./schema";

loadEnv({ path: ".env.local", override: false, quiet: true });
loadEnv({ override: false, quiet: true });

const categories = [
  {
    id: "medical_clinic",
    labelKo: "병원/클리닉",
    labelEn: "Medical clinic",
    description: "상담, 가격, 환불, 강매, 대기, 위생, 광고불일치 중심",
    sortOrder: 10
  },
  {
    id: "real_estate",
    labelKo: "부동산",
    labelEn: "Real estate",
    description: "허위매물, 가격 말바꾸기, 계약 압박, 사진 불일치 중심",
    sortOrder: 20
  },
  {
    id: "auto_repair",
    labelKo: "카센터",
    labelEn: "Auto repair",
    description: "과잉수리 의심, 견적 불일치, 사전 동의 없는 수리 중심",
    sortOrder: 30
  }
] as const;

const seededRiskTags = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    category: "medical_clinic",
    code: "consultation_issue",
    labelKo: "상담 불만",
    labelEn: "Consultation issue",
    sortOrder: 10
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    category: "medical_clinic",
    code: "price_mismatch",
    labelKo: "가격 고지 불일치",
    labelEn: "Price mismatch",
    sortOrder: 20
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    category: "medical_clinic",
    code: "refund_issue",
    labelKo: "환불 불만",
    labelEn: "Refund issue",
    sortOrder: 30
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    category: "medical_clinic",
    code: "pressure_sales",
    labelKo: "강매성 상담",
    labelEn: "Pressure sales",
    sortOrder: 40
  },
  {
    id: "10000000-0000-4000-8000-000000000005",
    category: "medical_clinic",
    code: "long_wait",
    labelKo: "대기 시간",
    labelEn: "Long wait",
    sortOrder: 50
  },
  {
    id: "10000000-0000-4000-8000-000000000006",
    category: "medical_clinic",
    code: "hygiene_issue",
    labelKo: "위생/시설",
    labelEn: "Hygiene/facility",
    sortOrder: 60
  },
  {
    id: "10000000-0000-4000-8000-000000000007",
    category: "medical_clinic",
    code: "ad_mismatch",
    labelKo: "광고와 실제 불일치",
    labelEn: "Ad mismatch",
    sortOrder: 70
  },
  {
    id: "20000000-0000-4000-8000-000000000001",
    category: "real_estate",
    code: "fake_listing_suspected",
    labelKo: "허위매물 의심",
    labelEn: "Fake listing suspected",
    sortOrder: 10
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    category: "real_estate",
    code: "price_changed",
    labelKo: "가격 말바꾸기",
    labelEn: "Price changed",
    sortOrder: 20
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    category: "real_estate",
    code: "maintenance_fee_mismatch",
    labelKo: "관리비 설명 불일치",
    labelEn: "Maintenance fee mismatch",
    sortOrder: 30
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    category: "real_estate",
    code: "room_condition_mismatch",
    labelKo: "방 상태 불일치",
    labelEn: "Room condition mismatch",
    sortOrder: 40
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    category: "real_estate",
    code: "contract_pressure",
    labelKo: "계약 전 압박",
    labelEn: "Contract pressure",
    sortOrder: 50
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    category: "real_estate",
    code: "photo_mismatch",
    labelKo: "사진과 실제 불일치",
    labelEn: "Photo mismatch",
    sortOrder: 60
  },
  {
    id: "30000000-0000-4000-8000-000000000001",
    category: "auto_repair",
    code: "overrepair_suspected",
    labelKo: "과잉수리 의심",
    labelEn: "Overrepair suspected",
    sortOrder: 10
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    category: "auto_repair",
    code: "estimate_mismatch",
    labelKo: "견적 불일치",
    labelEn: "Estimate mismatch",
    sortOrder: 20
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    category: "auto_repair",
    code: "issue_recurred",
    labelKo: "정비 후 문제 재발",
    labelEn: "Issue recurred",
    sortOrder: 30
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    category: "auto_repair",
    code: "parts_explanation_missing",
    labelKo: "부품 설명 부족",
    labelEn: "Parts explanation missing",
    sortOrder: 40
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    category: "auto_repair",
    code: "repair_without_consent",
    labelKo: "사전 동의 없는 수리",
    labelEn: "Repair without consent",
    sortOrder: 50
  },
  {
    id: "30000000-0000-4000-8000-000000000006",
    category: "auto_repair",
    code: "invoice_issue",
    labelKo: "명세서 미흡",
    labelEn: "Invoice issue",
    sortOrder: 60
  }
] as const;

async function main() {
  const db = createDb();

  await db
    .insert(subjectCategories)
    .values([...categories])
    .onConflictDoNothing();

  await db
    .insert(riskTags)
    .values(
      seededRiskTags.map(({ sortOrder: _sortOrder, ...tag }) => ({
        ...tag,
        isActive: true
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(subjectCategoryRiskTags)
    .values(
      seededRiskTags.map((tag) => ({
        category: tag.category,
        riskTagId: tag.id,
        sortOrder: tag.sortOrder,
        isActive: true
      }))
    )
    .onConflictDoNothing();
}

main()
  .then(() => {
    console.log("Xreviews seed data inserted.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
