-- CreateIndex
CREATE INDEX "announcements_isPublished_audience_publishedAt_idx" ON "announcements"("isPublished", "audience", "publishedAt");

-- CreateIndex
CREATE INDEX "applications_appliedAt_idx" ON "applications"("appliedAt");

-- CreateIndex
CREATE INDEX "applications_status_appliedAt_idx" ON "applications"("status", "appliedAt");

-- CreateIndex
CREATE INDEX "attendance_date_status_idx" ON "attendance"("date", "status");

-- CreateIndex
CREATE INDEX "candidates_createdAt_idx" ON "candidates"("createdAt");

-- CreateIndex
CREATE INDEX "employees_status_createdAt_idx" ON "employees"("status", "createdAt");

-- CreateIndex
CREATE INDEX "employees_departmentId_status_idx" ON "employees"("departmentId", "status");

-- CreateIndex
CREATE INDEX "employees_dateOfJoining_idx" ON "employees"("dateOfJoining");

-- CreateIndex
CREATE INDEX "feedback_employeeId_createdAt_idx" ON "feedback"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_category_createdAt_idx" ON "feedback"("category", "createdAt");

-- CreateIndex
CREATE INDEX "goals_employeeId_status_idx" ON "goals"("employeeId", "status");

-- CreateIndex
CREATE INDEX "interviews_status_scheduledAt_idx" ON "interviews"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "jobs_status_createdAt_idx" ON "jobs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "leave_balances_year_idx" ON "leave_balances"("year");

-- CreateIndex
CREATE INDEX "leave_balances_employeeId_year_idx" ON "leave_balances"("employeeId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_createdAt_idx" ON "leave_requests"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "leave_requests_status_createdAt_idx" ON "leave_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "leave_requests_startDate_endDate_idx" ON "leave_requests"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "offers_status_createdAt_idx" ON "offers"("status", "createdAt");

-- CreateIndex
CREATE INDEX "performance_reviews_employeeId_cycle_idx" ON "performance_reviews"("employeeId", "cycle");

-- CreateIndex
CREATE INDEX "performance_reviews_status_createdAt_idx" ON "performance_reviews"("status", "createdAt");

-- CreateIndex
CREATE INDEX "salaries_isActive_idx" ON "salaries"("isActive");
