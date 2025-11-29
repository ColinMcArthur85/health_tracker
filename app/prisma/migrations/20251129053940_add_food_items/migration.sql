-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nutritionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fdcId" TEXT,
    "servingSize" REAL,
    "servingUnit" TEXT,
    "calories" INTEGER,
    "protein" INTEGER,
    "carbs" INTEGER,
    "fat" INTEGER,
    "fiber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodItem_nutritionId_fkey" FOREIGN KEY ("nutritionId") REFERENCES "Nutrition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
