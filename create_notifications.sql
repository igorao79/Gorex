-- Create Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create index on userId
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- Create index on createdAt
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- Add foreign key constraint
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add taskId column (optional foreign key to Task)
ALTER TABLE "Notification" ADD COLUMN "taskId" TEXT;

-- Add foreign key constraint for taskId
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index on taskId
CREATE INDEX "Notification_taskId_idx" ON "Notification"("taskId");
