-- 将单一 marketingOptIn 拆分为「行程提醒」与「简报/优惠资讯」两项订阅偏好

ALTER TABLE "User" ADD COLUMN "planningReminderOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "productNewsOptIn" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET
  "planningReminderOptIn" = "marketingOptIn",
  "productNewsOptIn" = "marketingOptIn"
WHERE "marketingOptIn" = true;

ALTER TABLE "User" DROP COLUMN "marketingOptIn";
