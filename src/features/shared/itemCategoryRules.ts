import { ITEM_COLORS } from "@/features/admin/itemFormOptions"

export type DynamicFieldConfig = {
  key: string
  label: string
  type: "text" | "select" | "textarea"
  required: boolean
  placeholder?: string
  prompt?: string
  options?: string[]
}

export type DynamicFieldGroup = {
  heading: string
  fields: DynamicFieldConfig[]
}

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase()
}

export function isDocumentsCategory(category: string): boolean {
  return normalizeCategory(category).includes("document")
}

export function isWalletIdsCategory(category: string): boolean {
  const normalized = normalizeCategory(category)
  return normalized.includes("wallet") || normalized.includes("id")
}

export function isBagsCategory(category: string): boolean {
  const normalized = normalizeCategory(category)
  return normalized.includes("bag") || normalized.includes("backpack")
}

export function requiresColorSelection(category: string): boolean {
  if (!category.trim()) {
    return true
  }

  if (isDocumentsCategory(category) || isWalletIdsCategory(category)) {
    return false
  }

  return true
}

export function getClaimFieldGroup(category: string): DynamicFieldGroup {
  const normalized = normalizeCategory(category)

  if (normalized.includes("electronics")) {
    return {
      heading: "Group A: Electronics & Tech",
      fields: [
        {
          key: "deviceNameOrUsername",
          label: "Device Name / Account Name",
          type: "text",
          required: true,
          placeholder: "e.g., John-iphone-15",
        },
        {
          key: "lockScreenWallpaper",
          label: "Lock Screen Description",
          type: "text",
          required: true,
          placeholder: "Describe the lock screen image or text",
        },
        {
          key: "externalCaseOrColor",
          label: "Case Style / Color",
          type: "select",
          required: true,
          options: [...ITEM_COLORS],
        },
        {
          key: "serialNumberOrMacAddress",
          label: "Serial Number / Device ID",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
      ],
    }
  }

  if (isDocumentsCategory(category)) {
    return {
      heading: "Group B: Documents & IDs",
      fields: [
        {
          key: "documentType",
          label: "Document Type",
          type: "select",
          required: true,
          options: ["Student ID", "Government ID", "Passport", "Permit", "Certificate", "Academic Paper", "Other"],
        },
        {
          key: "namePrintedOnDocument",
          label: "Name Printed on Document",
          type: "text",
          required: true,
          placeholder: "Enter the exact printed name",
        },
        {
          key: "issuingOfficeOrSchool",
          label: "Issuing Office / School",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
        {
          key: "identifierFragment",
          label: "Last 3-4 Characters of ID Number",
          type: "text",
          required: false,
          placeholder: "Optional (last 3-4 characters only)",
          prompt: "For safety, do not type the full number.",
        },
      ],
    }
  }

  if (isBagsCategory(category)) {
    return {
      heading: "Group C: Bags & Backpacks",
      fields: [
        {
          key: "brandOrMake",
          label: "Brand / Make",
          type: "text",
          required: true,
          placeholder: "e.g., Jansport",
        },
        {
          key: "externalColorOrPattern",
          label: "External Color / Pattern",
          type: "select",
          required: true,
          options: [...ITEM_COLORS],
        },
        {
          key: "specificInternalContents",
          label: "Items Inside",
          type: "textarea",
          required: true,
          placeholder: "List specific IDs, cards, or exact items inside.",
          prompt: "List specific IDs, cards, or exact items inside.",
        },
      ],
    }
  }

  if (isWalletIdsCategory(category)) {
    return {
      heading: "Group D: Wallets & IDs",
      fields: [
        {
          key: "walletMaterialOrColor",
          label: "Wallet Material / Color",
          type: "select",
          required: true,
          options: [...ITEM_COLORS, "Leather", "Canvas", "Transparent"],
        },
        {
          key: "specificInternalContents",
          label: "Items Inside",
          type: "textarea",
          required: true,
          placeholder: "List specific cards, receipts, or IDs kept inside.",
        },
        {
          key: "idNameHint",
          label: "Name on Any ID Inside",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
      ],
    }
  }

  if (normalized.includes("jewelry") || normalized.includes("accessories")) {
    return {
      heading: "Group E: Jewelry & Accessories",
      fields: [
        {
          key: "materialOrColor",
          label: "Material / Color",
          type: "select",
          required: true,
          options: ["Gold", "Silver", "Leather", "Rose Gold", "Black", "Multi-color"],
        },
        {
          key: "engravingsOrInscriptions",
          label: "Engravings / Inscriptions",
          type: "text",
          required: false,
          placeholder: "Optional",
        },
        {
          key: "distinctiveDamageOrFeatures",
          label: "Distinctive Damage / Features",
          type: "textarea",
          required: true,
          placeholder: "e.g., Missing stones, scratched face, specific clasp.",
        },
      ],
    }
  }

  return {
    heading: "Group F: Everyday Items",
    fields: [
      {
        key: "brandOrIdentifyingText",
        label: "Brand or Identifying Text",
        type: "text",
        required: true,
        placeholder: "e.g., HydroFlask or Property of Juan",
      },
      {
        key: "distinctiveFeaturesAndCondition",
        label: "Distinctive Features",
        type: "textarea",
        required: true,
        placeholder: "Describe specific scratches, stickers, torn pages, or stains.",
      },
    ],
  }
}
