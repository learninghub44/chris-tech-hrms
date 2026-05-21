import type { QueryClient } from "@tanstack/react-query";
import {
  getAttendanceReport,
  getAttendanceReportData,
  getDashboardSummary,
  getEmployeeReport,
  getLeaveReportData,
  getMyAttendance,
  getMyEmployeeProfile,
  getPayrollReportData,
  listAnnouncements,
  listApplications,
  listCandidates,
  listDepartments,
  listDesignations,
  listEmployees,
  listFeedbackRecords,
  listGoals,
  listHolidays,
  listInterviews,
  listJobs,
  listLeaveBalances,
  listLeaveRequests,
  listLeaveTypes,
  listMyLeaves,
  listMyPayslips,
  listNotifications,
  listOffers,
  listPayrolls,
  listPerformanceEmployees,
  listPerformanceReviews,
  listSalaries,
  listShifts
} from "@/lib/api";
import { getMonthStartInputValue, getTodayInputValue } from "@/lib/time-format";

function prefetchQuery(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<unknown>
) {
  void queryClient.prefetchQuery({
    queryKey,
    queryFn
  });
}

export function prefetchNavData(
  queryClient: QueryClient,
  token: string,
  href: string
) {
  const dateFrom = getMonthStartInputValue();
  const dateTo = getTodayInputValue();
  const year = new Date().getFullYear();

  if (href === "/dashboard") {
    prefetchQuery(queryClient, ["dashboard-summary", token], () =>
      getDashboardSummary(token)
    );
    return;
  }

  if (href === "/reports") {
    prefetchQuery(queryClient, ["report-employees", token, dateFrom, dateTo], () =>
      getEmployeeReport(token, { dateFrom, dateTo })
    );
    prefetchQuery(queryClient, ["report-attendance", token, dateFrom, dateTo], () =>
      getAttendanceReportData(token, { dateFrom, dateTo })
    );
    prefetchQuery(queryClient, ["report-leaves", token, dateFrom, dateTo], () =>
      getLeaveReportData(token, { dateFrom, dateTo })
    );
    prefetchQuery(queryClient, ["report-payroll", token, year], () =>
      getPayrollReportData(token, { year })
    );
    return;
  }

  if (href === "/notifications") {
    prefetchQuery(queryClient, ["notifications", token], () => listNotifications(token));
    return;
  }

  if (href === "/announcements") {
    prefetchQuery(queryClient, ["announcements", token], () => listAnnouncements(token));
    return;
  }

  if (href === "/jobs") {
    prefetchQuery(queryClient, ["jobs", token, ""], () =>
      listJobs(token, { status: "" })
    );
    prefetchQuery(queryClient, ["departments", token, "jobs"], () =>
      listDepartments(token)
    );
    prefetchQuery(queryClient, ["designations", token, "jobs"], () =>
      listDesignations(token)
    );
    return;
  }

  if (href === "/candidates") {
    prefetchQuery(queryClient, ["candidates", token, ""], () =>
      listCandidates(token, { search: "" })
    );
    prefetchQuery(queryClient, ["jobs", token, "candidate-form"], () =>
      listJobs(token, { status: "OPEN" })
    );
    return;
  }

  if (href === "/interviews") {
    prefetchQuery(queryClient, ["interviews", token], () => listInterviews(token));
    prefetchQuery(queryClient, ["applications", token, "interview-form"], () =>
      listApplications(token)
    );
    prefetchQuery(queryClient, ["employees", token, "interviewers"], () =>
      listEmployees(token, { status: "ACTIVE" })
    );
    return;
  }

  if (href === "/offers") {
    prefetchQuery(queryClient, ["offers", token], () => listOffers(token));
    prefetchQuery(queryClient, ["applications", token, "offer-form"], () =>
      listApplications(token)
    );
    return;
  }

  if (href === "/goals") {
    prefetchQuery(queryClient, ["performance-employees", token, "goals"], () =>
      listPerformanceEmployees(token, {})
    );
    prefetchQuery(queryClient, ["goals", token, "", ""], () =>
      listGoals(token, { employeeId: "", status: "" })
    );
    return;
  }

  if (href === "/performance-reviews") {
    prefetchQuery(queryClient, ["performance-employees", token, "reviews"], () =>
      listPerformanceEmployees(token, {})
    );
    prefetchQuery(queryClient, ["performance-reviews", token, "", "", ""], () =>
      listPerformanceReviews(token, { employeeId: "", status: "", cycle: "" })
    );
    return;
  }

  if (href === "/feedback") {
    prefetchQuery(queryClient, ["performance-employees", token, "feedback"], () =>
      listPerformanceEmployees(token, {})
    );
    prefetchQuery(queryClient, ["feedback", token, "", ""], () =>
      listFeedbackRecords(token, { employeeId: "", category: "" })
    );
    return;
  }

  if (href === "/appraisals") {
    prefetchQuery(queryClient, ["performance-employees", token, "appraisals"], () =>
      listPerformanceEmployees(token, {})
    );
    prefetchQuery(queryClient, ["appraisals", token, "", ""], () =>
      listPerformanceReviews(token, { employeeId: "", cycle: "" })
    );
    return;
  }

  if (href === "/profile") {
    prefetchQuery(queryClient, ["my-employee-profile", token], () =>
      getMyEmployeeProfile(token)
    );
    return;
  }

  if (href === "/employees") {
    prefetchQuery(queryClient, ["employees", token, "", "", ""], () =>
      listEmployees(token, { search: "", status: "", departmentId: "" })
    );
    prefetchQuery(queryClient, ["departments", token], () => listDepartments(token));
    return;
  }

  if (href === "/departments") {
    prefetchQuery(queryClient, ["departments", token], () => listDepartments(token));
    return;
  }

  if (href === "/designations") {
    prefetchQuery(queryClient, ["departments", token], () => listDepartments(token));
    prefetchQuery(queryClient, ["designations", token], () => listDesignations(token));
    return;
  }

  if (href === "/attendance") {
    prefetchQuery(queryClient, ["my-attendance", token, dateFrom, dateTo], () =>
      getMyAttendance(token, { dateFrom, dateTo })
    );
    return;
  }

  if (href === "/attendance/report") {
    prefetchQuery(
      queryClient,
      ["attendance-report", token, dateFrom, dateTo, "", "", ""],
      () =>
        getAttendanceReport(token, {
          dateFrom,
          dateTo,
          employeeId: "",
          departmentId: "",
          status: ""
        })
    );
    prefetchQuery(queryClient, ["employees", token, "attendance-report"], () =>
      listEmployees(token, {})
    );
    prefetchQuery(queryClient, ["departments", token, "attendance-report"], () =>
      listDepartments(token)
    );
    return;
  }

  if (href === "/shifts") {
    prefetchQuery(queryClient, ["shifts", token], () => listShifts(token));
    return;
  }

  if (href === "/holidays") {
    prefetchQuery(queryClient, ["holidays", token, year], () =>
      listHolidays(token, year)
    );
    return;
  }

  if (href === "/leaves/apply") {
    prefetchQuery(queryClient, ["leave-types", token], () => listLeaveTypes(token));
    prefetchQuery(queryClient, ["leave-balances", token, year], () =>
      listLeaveBalances(token, { year })
    );
    return;
  }

  if (href === "/leaves/me") {
    prefetchQuery(queryClient, ["my-leaves", token], () => listMyLeaves(token));
    return;
  }

  if (href === "/leaves/approvals") {
    prefetchQuery(queryClient, ["leave-approvals", token, "", ""], () =>
      listLeaveRequests(token, { status: "", departmentId: "" })
    );
    prefetchQuery(queryClient, ["departments", token, "leave-approvals"], () =>
      listDepartments(token)
    );
    return;
  }

  if (href === "/leaves/balances") {
    prefetchQuery(queryClient, ["leave-balances", token, year], () =>
      listLeaveBalances(token, { year })
    );
    return;
  }

  if (href === "/leave-types") {
    prefetchQuery(queryClient, ["leave-types", token, "settings"], () =>
      listLeaveTypes(token)
    );
    return;
  }

  if (href === "/salaries") {
    prefetchQuery(queryClient, ["salaries", token], () => listSalaries(token));
    prefetchQuery(queryClient, ["employees", token, "salary-setup"], () =>
      listEmployees(token, {})
    );
    return;
  }

  if (href === "/payroll") {
    prefetchQuery(queryClient, ["payrolls", token, year], () =>
      listPayrolls(token, { year })
    );
    return;
  }

  if (href === "/payroll/me") {
    prefetchQuery(queryClient, ["my-payslips", token], () => listMyPayslips(token));
  }
}
