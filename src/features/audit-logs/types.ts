export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  details: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  actor?: string;
  action?: string;
}
