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
              reportedLostAtUtc: new Date(Date.now() - 3600000).toISOString(),
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
              reportedLostAtUtc: new Date(Date.now() - 7200000).toISOString(),
              status: "ACTIVE_SEARCH",
              reporterUser: { name: "Mike Peterson", studentId: "2020-009281" }
            },
            {
              id: "rep-3",
              reportCode: "RL-8823",
              title: "Black Leather Wallet",
              category: "Wallets/IDs",
              color: "Black",
              location: "Student Center",
              reportedLostAtUtc: new Date(Date.now() - 172800000).toISOString(),
              status: "UNDER_REVIEW",
              reporterUser: { name: "Emily Chen", studentId: "2022-044212" }
            },
            {
              id: "rep-4",
              reportCode: "RL-8824",
              title: "Red Muji Notebook",
              category: "Stationery",
              color: "Red",
              location: "Engineering Quad",
              reportedLostAtUtc: new Date(Date.now() - 86400000).toISOString(),
              status: "ACTIVE_SEARCH",
              reporterUser: { name: "John Doe", studentId: "2023-0001" }
            },
            {
              id: "rep-5",
              reportCode: "RL-8825",
              title: "Sony Earbuds Case",
              category: "Electronics",
              color: "Black",
              location: "Library Hub",
              reportedLostAtUtc: new Date(Date.now() - 432000000).toISOString(),
              status: "RESOLVED",
              reporterUser: { name: "John Doe", studentId: "2023-0001" }
            }
          ],
          pagination: { page: 1, limit: 25, total: 5, pageCount: 1 }
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
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              submittedProof: { brand: "Apple", serialNumber: "C02XG..." },
              claimantUser: { name: "John Doe", studentId: "2023-0001", email: "john@students.nu.edu.ph" },
              foundItem: MOCK_ITEMS[0]
            },
            {
              id: "claim-2",
              claimCode: "CL-9902",
              status: "APPROVED",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              submittedProof: { color: "Brown", material: "Leather" },
              claimantUser: { name: "John Doe", studentId: "2023-0001", email: "john@students.nu.edu.ph" },
              foundItem: MOCK_ITEMS[1]
            },
            {
              id: "claim-3",
              claimCode: "CL-9903",
              status: "INQUIRY_REQUIRED",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              reviewerNote: "Please upload a photo of the bottom showing the stickers.",
              submittedProof: { color: "White", size: "32oz" },
              claimantUser: { name: "John Doe", studentId: "2023-0001", email: "john@students.nu.edu.ph" },
              foundItem: MOCK_ITEMS[2]
            },
            {
              id: "claim-4",
              claimCode: "CL-9904",
              status: "DENIED",
              createdAt: new Date(Date.now() - 259200000).toISOString(),
              reviewerNote: "Physical description did not match the item in custody.",
              claimantUser: { name: "John Doe", studentId: "2023-0001", email: "john@students.nu.edu.ph" },
              foundItem: MOCK_ITEMS[3]
            }
          ],
          pagination: { page: 1, limit: 25, total: 4, pageCount: 1 }
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
              sourceCode: "CL-9902",
              itemTitle: "Leather Wallet",
              inventoryCode: "ITM-002",
              pickupToken: "TK-4921-X",
              pickupTokenExpires: new Date(Date.now() + 172800000).toISOString(),
              officeLocation: "Lost & Found Desk, Student Affairs Office",
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              source: "REPORT_MATCH",
              sourceCode: "RL-8825",
              itemTitle: "Sony Earbuds Case",
              inventoryCode: "ITM-005",
              pickupToken: "TK-8822-Y",
              pickupTokenExpires: new Date(Date.now() + 86400000).toISOString(),
              officeLocation: "ITS Helpdesk, Engineering Building",
              createdAt: new Date(Date.now() - 43200000).toISOString()
            }
          ]
        } as any
      };
    }

    if (url === "/notifications") {
      return {
        data: {
          notifications: [
            { id: "s-n1", title: "Claim Approved!", message: "Your claim CL-9902 for Leather Wallet has been approved. View token in 'Ready to Claim'.", route: "/user/ready-to-claim", createdAt: new Date(Date.now() - 1800000).toISOString(), readAt: null },
            { id: "s-n2", title: "Verification Update", message: "Admin requires additional proof for your Hydro Flask claim (CL-9903).", route: "/user/claims", createdAt: new Date(Date.now() - 3600000).toISOString(), readAt: null },
            { id: "s-n3", title: "Potential Match Found", message: "A new item matching your 'Red Notebook' report has been logged.", route: "/gallery", createdAt: new Date(Date.now() - 86400000).toISOString(), readAt: new Date().toISOString() },
            { id: "n1", title: "New Item Captured", message: "AI Camera at Engineering Quad detected a potential Camera.", route: "/admin/captured-items", createdAt: new Date(Date.now() - 1800000).toISOString(), readAt: null },
            { id: "n2", title: "Claim Pending Review", message: "Sarah Jenkins submitted a claim for MacBook Air (ITM-002).", route: "/admin/claims", createdAt: new Date(Date.now() - 3600000).toISOString(), readAt: null }
          ]
        } as any
      }
    }

    if (url === "/admin/users") {
      const search = config?.params?.search?.toLowerCase();
      let users = MOCK_USERS.filter(u => u.role !== "ADMIN");
      
      if (search) {
        users = users.filter(u => 
          u.name.toLowerCase().includes(search) || 
          u.email.toLowerCase().includes(search) || 
          u.studentId?.toLowerCase().includes(search)
        );
      }

      return {
         data: {
           users: users.map(u => ({
             ...u,
             stats: {
               totalClaims: Math.floor(Math.random() * 5),
               totalReports: Math.floor(Math.random() * 3),
               verificationStatus: u.role === "STAFF" ? "VERIFIED" : (Math.random() > 0.2 ? "VERIFIED" : "PENDING")
             }
           }))
         } as any
      };
    }

    if (url === "/inventory/expired") {
      const expiredItems = MOCK_ITEMS.filter(i => i.status === "EXPIRED");
      return {
        data: {
          items: expiredItems.map(i => ({
            ...i,
            daysExpired: Math.floor(Math.random() * 14) + 1,
            disposalEligibility: "DONATION"
          }))
        } as any
      }
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
