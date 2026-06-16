-- DropForeignKey
ALTER TABLE "public"."UserFavoriteGame" DROP CONSTRAINT "UserFavoriteGame_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserFavoriteGame" DROP CONSTRAINT "UserFavoriteGame_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameCountry" DROP CONSTRAINT "GameCountry_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameCountry" DROP CONSTRAINT "GameCountry_countryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GamePlay" DROP CONSTRAINT "GamePlay_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GamePlay" DROP CONSTRAINT "GamePlay_gameId_fkey";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."UserFavoriteGame";

-- DropTable
DROP TABLE "public"."Country";

-- DropTable
DROP TABLE "public"."Game";

-- DropTable
DROP TABLE "public"."GameCountry";

-- DropTable
DROP TABLE "public"."GamePlay";

-- DropEnum
DROP TYPE "public"."UserStatus";

-- DropEnum
DROP TYPE "public"."GamePlayResultType";

