-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "photoId" INTEGER NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "createdAt", "id", "photoId", "updatedAt", "userId") SELECT "content", "createdAt", "id", "photoId", "updatedAt", "userId" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE TABLE "new_Login" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Login_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Login" ("createdAt", "id", "status", "userId") SELECT "createdAt", "id", "status", "userId" FROM "Login";
DROP TABLE "Login";
ALTER TABLE "new_Login" RENAME TO "Login";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'M',
    "birthday" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL DEFAULT '0691111111',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "countPhotosCreated" INTEGER NOT NULL DEFAULT 0,
    "countCommentsCreated" INTEGER NOT NULL DEFAULT 0,
    "countCommentsLiked" INTEGER NOT NULL DEFAULT 0,
    "countPhotosLiked" INTEGER NOT NULL DEFAULT 0,
    "countLogins" INTEGER NOT NULL DEFAULT 0,
    "countFollowers" INTEGER NOT NULL DEFAULT 0,
    "countFollowing" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("birthday", "createdAt", "email", "firstName", "gender", "id", "lastName", "password", "phoneNumber", "updatedAt", "userName") SELECT "birthday", "createdAt", "email", "firstName", "gender", "id", "lastName", "password", "phoneNumber", "updatedAt", "userName" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
