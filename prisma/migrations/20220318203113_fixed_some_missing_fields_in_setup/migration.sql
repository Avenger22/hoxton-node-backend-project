/*
  Warnings:

  - You are about to alter the column `height` on the `Photo` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `width` on the `Photo` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `height` on the `Avatar` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `width` on the `Avatar` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Login" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Login_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Login" ("createdAt", "id", "status", "userId") SELECT "createdAt", "id", "status", "userId" FROM "Login";
DROP TABLE "Login";
ALTER TABLE "new_Login" RENAME TO "Login";
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "userId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "createdAt", "id", "photoId", "updatedAt", "userId") SELECT "content", "createdAt", "id", "photoId", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caption" TEXT NOT NULL,
    "height" INTEGER NOT NULL DEFAULT 250,
    "width" INTEGER NOT NULL DEFAULT 250,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "src" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("caption", "createdAt", "height", "id", "src", "updatedAt", "userId", "width") SELECT "caption", "createdAt", "height", "id", "src", "updatedAt", "userId", "width" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE TABLE "new_PhotoLike" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "userId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    CONSTRAINT "PhotoLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PhotoLike_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PhotoLike" ("createdAt", "id", "photoId", "updatedAt", "userId") SELECT "createdAt", "id", "photoId", "updatedAt", "userId" FROM "PhotoLike";
DROP TABLE "PhotoLike";
ALTER TABLE "new_PhotoLike" RENAME TO "PhotoLike";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2022-03-18 14:21:00 +02:00'
);
INSERT INTO "new_User" ("birthday", "createdAt", "email", "firstName", "gender", "id", "lastName", "password", "phoneNumber", "updatedAt", "userName") SELECT "birthday", "createdAt", "email", "firstName", "gender", "id", "lastName", "password", "phoneNumber", "updatedAt", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_CommentLike" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    CONSTRAINT "CommentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CommentLike" ("commentId", "createdAt", "id", "updatedAt", "userId") SELECT "commentId", "createdAt", "id", "updatedAt", "userId" FROM "CommentLike";
DROP TABLE "CommentLike";
ALTER TABLE "new_CommentLike" RENAME TO "CommentLike";
CREATE TABLE "new_Avatar" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "height" INTEGER NOT NULL DEFAULT 50,
    "width" INTEGER NOT NULL DEFAULT 50,
    "src" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "updatedAt" DATETIME NOT NULL DEFAULT '2020-03-18 14:21:00 +02:00',
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Avatar" ("createdAt", "height", "id", "src", "updatedAt", "userId", "width") SELECT "createdAt", "height", "id", "src", "updatedAt", "userId", "width" FROM "Avatar";
DROP TABLE "Avatar";
ALTER TABLE "new_Avatar" RENAME TO "Avatar";
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
