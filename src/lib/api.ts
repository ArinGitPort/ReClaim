import { MOCK_ITEMS, MOCK_USERS, MOCK_CAPTURED_ITEMS } from "@/data/mockData";

const TOKEN_KEY = "reclaim-auth-token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Mock API implementation
export const api = {
  get: async <T>(url: string, config?: any): Promise<{ data: T }> => {
    console.log("[MOCK API] GET", url, config);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

    if (url === "/auth/me") {
      const token = getStoredToken();
      if (token === "mock-admin-token") {
        return { data: { user: MOCK_USERS[1] } as any };
      }
      if (token === "mock-student-token") {
        return { data: { user: MOCK_USERS[0] } as any };
      }
      throw new Error("Unauthorized");
    }

    if (url === "/reports") {
      return {
        data: {
          reports: [
            {
              id: "rep-1",
              reportCode: "RL-8821",
              title: "Silver MacBook Air 13-inch",
              category: "Electronics",
              color: "Silver",
              location: "Library Basement",
              reportedLostAtUtc: new Date().toISOString(),
              status: "SUBMITTED",
              reporterUser: { name: "Sarah Jenkins", studentId: "2021-100293" }
            },
            {
              id: "rep-2",
              reportCode: "RL-8822",
              title: "Blue Hydroflask 32oz",
              category: "Everyday Items",
              color: "Blue",
              location: "Gymnasium",
              reportedLostAtUtc: new Date().toISOString(),
              status: "ACTIVE_SEARCH",
              reporterUser: { name: "Mike Peterson", studentId: "2020-009281" }
            }
          ],
          pagination: { page: 1, limit: 25, total: 2, pageCount: 1 }
        } as any
      };
    }

    if (url === "/items/admin" || url === "/items/public") {
      const page = config?.params?.page || 1;
      const limit = config?.params?.limit || 12;
      const search = config?.params?.search?.toLowerCase();
      const category = config?.params?.category;
      const categories = config?.params?.categories ? config.params.categories.split(',') : [];
      const status = config?.params?.status;
      let location = config?.params?.location;
      if (location === "all") location = null;
      let dateLost = config?.params?.dateLost;
      if (dateLost === "any") dateLost = null;

      let filteredItems = [...MOCK_ITEMS];

      if (url === "/items/public") {
        filteredItems = filteredItems.filter((i) => i.status === "AVAILABLE");
      }

      if (search) {
        filteredItems = filteredItems.filter(i => 
          i.title.toLowerCase().includes(search) ||
          i.code.toLowerCase().includes(search) ||
          i.category.toLowerCase().includes(search) ||
          i.foundLocation.toLowerCase().includes(search) ||
          (i.description?.toLowerCase().includes(search) ?? false)
        );
      }

      if (status) {
        filteredItems = filteredItems.filter((i) => i.status === status);
      }

      if (category) {
        filteredItems = filteredItems.filter((i) => i.category === category);
      }

      if (categories.length > 0) {
        filteredItems = filteredItems.filter(i => categories.includes(i.category));
      }

      if (location) {
        // Mock matching logic for location dropdown
        filteredItems = filteredItems.filter(i => {
           if (location === "library" && i.foundLocation.toLowerCase().includes("library")) return true;
           if (location === "student_union" && i.foundLocation.toLowerCase().includes("union")) return true;
           if (location === "gym" && i.foundLocation.toLowerCase().includes("gym")) return true;
           return false;
        });
      }
      
      const st = (page - 1) * limit;
      const ed = st + limit;
      const paginatedItems = filteredItems.slice(st, ed);

      return {
        data: {
          items: paginatedItems,
          pagination: {
            page,
            limit,
            total: filteredItems.length,
            pageCount: Math.ceil(filteredItems.length / limit) || 1,
          }
        } as any
      };
    }

    if (url === "/claims") {
      return {
        data: {
          claims: [
            {
              id: "claim-1",
              claimCode: "CL-9901",
              status: "PENDING_VERIFICATION",
              createdAt: new Date().toISOString(),
              submittedProof: { brand: "Apple", serialNumber: "C02XG..." },
              claimantUser: { name: "Johnathan Doe", studentId: "2020-112233", email: "john@students.nu.edu.ph" },
              foundItem: MOCK_ITEMS[0]
            }
          ],
          pagination: { page: 1, limit: 25, total: 1, pageCount: 1 }
        } as any
      };
    }

    if (url === "/admin/captured-items") {
      return { data: MOCK_CAPTURED_ITEMS as any };
    }

    if (url === "/handover/logs") {
      return {
        data: {
          handovers: [
            {
              id: "hlog-1",
              pickupTokenPresented: "TK-4921-X",
              releasedAtUtc: new Date().toISOString(),
              note: "Student presented valid matching ID.",
              claim: { claimCode: "CL-9901" },
              foundItem: {
                code: "ITM-001",
                title: "iPhone 13 Pro",
                category: "Electronics",
                storageLocation: "Safe A1",
                status: "RELEASED"
              },
              releasedToUser: {
                name: "Johnathan Doe",
                studentId: "2020-112233",
                email: "john@students.nu.edu.ph"
              }
            },
            {
              id: "hlog-2",
              pickupTokenPresented: "TK-8822-Y",
              releasedAtUtc: new Date().toISOString(),
              note: "Physical description matched perfectly.",
              claim: { claimCode: "CL-8822" },
              foundItem: {
                code: "ITM-005",
                title: "Blue Hydroflask",
                category: "Everyday Items",
                storageLocation: "Shelf B2",
                status: "RELEASED"
              },
              releasedToUser: {
                name: "Sarah Jenkins",
                studentId: "2021-100293",
                email: "sarah@students.nu.edu.ph"
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 25,
            total: 2,
            pageCount: 1
          }
        } as any
      };
    }

    if (url === "/audit/logs") {
      return {
        data: {
          logs: [
            {
              id: "log-1",
              action: "ITEM_CREATED",
              targetType: "found_item",
              targetId: "itm-1",
              targetReferenceCode: "ITM-001",
              actionSentence: "logged Found Item (ITM-001)",
              createdAt: new Date().toISOString(),
              actorUser: { id: "u-2", name: "Admin Moderator", email: "admin@national-u.edu.ph", role: "ADMIN" }
            },
            {
              id: "log-2",
              action: "CLAIM_APPROVED",
              targetType: "claim",
              targetId: "cl-1",
              targetReferenceCode: "CL-9901",
              actionSentence: "approved Claim (CL-9901)",
              createdAt: new Date().toISOString(),
              actorUser: { id: "u-2", name: "Admin Moderator", email: "admin@national-u.edu.ph", role: "ADMIN" }
            }
          ],
          pagination: { page: 1, limit: 25, total: 2, pageCount: 1 }
        } as any
      };
    }

    if (url === "/user/pickups") {
      return {
        data: {
          pickups: [
            {
              source: "CLAIM",
              sourceCode: "CL-9901",
              itemTitle: "iPhone 13 Pro",
              inventoryCode: "ITM-001",
              pickupToken: "TK-4921-X",
              pickupTokenExpires: new Date(Date.now() + 86400000).toISOString(),
              officeLocation: "Lost & Found Desk, Student Affairs Office",
              createdAt: new Date().toISOString()
            }
          ]
        } as any
      };
    }

    return { data: {} as T };
  },

  post: async <T>(url: string, data?: any): Promise<{ data: T }> => {
    console.log("[MOCK API] POST", url, data);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (url === "/auth/login") {
      const { email } = data;
      if (email.includes("admin")) {
        return { data: { token: "mock-admin-token", user: MOCK_USERS[1] } as any };
      }
      return { data: { token: "mock-student-token", user: MOCK_USERS[0] } as any };
    }

    return { data: {} as T };
  },

  patch: async <T>(url: string, data?: any): Promise<{ data: T }> => {
    console.log("[MOCK API] PATCH", url, data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: {} as T };
  },

  delete: async <T>(url: string): Promise<{ data: T }> => {
    console.log("[MOCK API] DELETE", url);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: {} as T };
  }
};
