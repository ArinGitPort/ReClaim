declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "STUDENT" | "STAFF" | "ADMIN";
        email: string;
        adminPermissions: Array<
          | "DASHBOARD"
          | "INVENTORY"
          | "REPORTS"
          | "CLAIMS"
          | "LIVE_MONITOR"
          | "SNAPSHOTS"
          | "DISMISSED_SNAPSHOTS"
          | "HANDOVER_LOG"
          | "MATCH_HISTORY"
          | "USER_DIRECTORY"
          | "DELETED_ITEMS"
          | "AUDIT_LOGS"
          | "CAMERA_SETTINGS"
          | "SYSTEM_SETTINGS"
        >;
      };
    }
  }
}

export {};
