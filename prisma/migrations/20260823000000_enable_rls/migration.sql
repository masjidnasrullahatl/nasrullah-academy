-- Bật RLS cho toàn bộ bảng nghiệp vụ.
-- Không tạo policy nào => anon và authenticated bị từ chối hoàn toàn.
-- Prisma kết nối bằng role `postgres` (chủ sở hữu bảng, rolbypassrls) nên không bị ảnh hưởng.

ALTER TABLE "public"."programs"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."families"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."students"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."teachers"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classes"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."enrollments"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."monthly_invoices"  ENABLE ROW LEVEL SECURITY;

-- Phòng thủ lớp hai: thu hồi luôn quyền của anon/authenticated ở mức privilege.
-- Kể cả nếu RLS bị tắt nhầm sau này, PostgREST vẫn không đọc được.
REVOKE ALL ON ALL TABLES    IN SCHEMA "public" FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA "public" FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES  IN SCHEMA "public" FROM anon, authenticated;

-- Chặn cả bảng tạo ra trong tương lai.
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
