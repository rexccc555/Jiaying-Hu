-- 昵称全局唯一：不区分大小写，且以 LOWER(TRIM("name")) 为键（与注册接口 trim 后写入一致）
-- 若历史数据存在冲突，需先人工合并/改昵称后再执行本迁移
CREATE UNIQUE INDEX "User_nickname_lower_trim_key" ON "User" (LOWER(TRIM("name")));
