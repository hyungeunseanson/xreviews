-- Xreviews Phase 1 seed reference

insert into subject_categories (id, label_ko, label_en, description, sort_order) values
('medical_clinic', '병원/클리닉', 'Medical clinic', '상담, 가격, 환불, 강매, 대기, 위생, 광고불일치 중심', 10),
('real_estate', '부동산', 'Real estate', '허위매물, 가격 말바꾸기, 계약 압박, 사진 불일치 중심', 20),
('auto_repair', '카센터', 'Auto repair', '과잉수리 의심, 견적 불일치, 사전 동의 없는 수리 중심', 30)
on conflict (id) do nothing;

insert into risk_tags (id, category, code, label_ko, label_en) values
('10000000-0000-4000-8000-000000000001', 'medical_clinic', 'consultation_issue', '상담 불만', 'Consultation issue'),
('10000000-0000-4000-8000-000000000002', 'medical_clinic', 'price_mismatch', '가격 고지 불일치', 'Price mismatch'),
('10000000-0000-4000-8000-000000000003', 'medical_clinic', 'refund_issue', '환불 불만', 'Refund issue'),
('10000000-0000-4000-8000-000000000004', 'medical_clinic', 'pressure_sales', '강매성 상담', 'Pressure sales'),
('10000000-0000-4000-8000-000000000005', 'medical_clinic', 'long_wait', '대기 시간', 'Long wait'),
('10000000-0000-4000-8000-000000000006', 'medical_clinic', 'hygiene_issue', '위생/시설', 'Hygiene/facility'),
('10000000-0000-4000-8000-000000000007', 'medical_clinic', 'ad_mismatch', '광고와 실제 불일치', 'Ad mismatch'),

('20000000-0000-4000-8000-000000000001', 'real_estate', 'fake_listing_suspected', '허위매물 의심', 'Fake listing suspected'),
('20000000-0000-4000-8000-000000000002', 'real_estate', 'price_changed', '가격 말바꾸기', 'Price changed'),
('20000000-0000-4000-8000-000000000003', 'real_estate', 'maintenance_fee_mismatch', '관리비 설명 불일치', 'Maintenance fee mismatch'),
('20000000-0000-4000-8000-000000000004', 'real_estate', 'room_condition_mismatch', '방 상태 불일치', 'Room condition mismatch'),
('20000000-0000-4000-8000-000000000005', 'real_estate', 'contract_pressure', '계약 전 압박', 'Contract pressure'),
('20000000-0000-4000-8000-000000000006', 'real_estate', 'photo_mismatch', '사진과 실제 불일치', 'Photo mismatch'),

('30000000-0000-4000-8000-000000000001', 'auto_repair', 'overrepair_suspected', '과잉수리 의심', 'Overrepair suspected'),
('30000000-0000-4000-8000-000000000002', 'auto_repair', 'estimate_mismatch', '견적 불일치', 'Estimate mismatch'),
('30000000-0000-4000-8000-000000000003', 'auto_repair', 'issue_recurred', '정비 후 문제 재발', 'Issue recurred'),
('30000000-0000-4000-8000-000000000004', 'auto_repair', 'parts_explanation_missing', '부품 설명 부족', 'Parts explanation missing'),
('30000000-0000-4000-8000-000000000005', 'auto_repair', 'repair_without_consent', '사전 동의 없는 수리', 'Repair without consent'),
('30000000-0000-4000-8000-000000000006', 'auto_repair', 'invoice_issue', '명세서 미흡', 'Invoice issue')
on conflict (category, code) do nothing;

insert into subject_category_risk_tags (category, risk_tag_id, sort_order) values
('medical_clinic', '10000000-0000-4000-8000-000000000001', 10),
('medical_clinic', '10000000-0000-4000-8000-000000000002', 20),
('medical_clinic', '10000000-0000-4000-8000-000000000003', 30),
('medical_clinic', '10000000-0000-4000-8000-000000000004', 40),
('medical_clinic', '10000000-0000-4000-8000-000000000005', 50),
('medical_clinic', '10000000-0000-4000-8000-000000000006', 60),
('medical_clinic', '10000000-0000-4000-8000-000000000007', 70),
('real_estate', '20000000-0000-4000-8000-000000000001', 10),
('real_estate', '20000000-0000-4000-8000-000000000002', 20),
('real_estate', '20000000-0000-4000-8000-000000000003', 30),
('real_estate', '20000000-0000-4000-8000-000000000004', 40),
('real_estate', '20000000-0000-4000-8000-000000000005', 50),
('real_estate', '20000000-0000-4000-8000-000000000006', 60),
('auto_repair', '30000000-0000-4000-8000-000000000001', 10),
('auto_repair', '30000000-0000-4000-8000-000000000002', 20),
('auto_repair', '30000000-0000-4000-8000-000000000003', 30),
('auto_repair', '30000000-0000-4000-8000-000000000004', 40),
('auto_repair', '30000000-0000-4000-8000-000000000005', 50),
('auto_repair', '30000000-0000-4000-8000-000000000006', 60)
on conflict (category, risk_tag_id) do nothing;
