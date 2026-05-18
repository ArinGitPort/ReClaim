export type DynamicFieldConfig = {
  key: string
  label: string
  type: "text" | "select" | "textarea"
  required: boolean
  placeholder?: string
  prompt?: string
  options?: readonly string[]
}

export type DynamicFieldGroup = {
  heading: string
  fields: DynamicFieldConfig[]
}

export type ClaimFieldContext = {
  electronicItemType?: string | null
  collectElectronicItemType?: boolean
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

export function requiresColorSelection(_category: string): boolean {
  return true
}

export function getClaimFieldGroup(category: string, context: ClaimFieldContext = {}): DynamicFieldGroup {
  const normalized = normalizeCategory(category)

  if (normalized.includes("electronics")) {
    const electronicItemType = normalizeElectronicItemType(context.electronicItemType)

    if (isPersonalElectronicType(electronicItemType)) {
      return {
        heading: "Group A: Electronics & Personal Devices",
        fields: [
          {
            key: "brandOrModel",
            label: "Brand / Model",
            type: "text",
            required: true,
            placeholder: "e.g., iPhone 15, MacBook Air, Samsung tablet",
          },
          {
            key: "deviceNameOrAccount",
            label: "Device Name / Account Name",
            type: "text",
            required: true,
            placeholder: "e.g., John's iPhone, campus email, laptop device name",
          },
          {
            key: "screenOrPairingDescription",
            label: "Lock Screen / Setup Description",
            type: "textarea",
            required: true,
            placeholder: "Describe the lock screen, wallpaper, login hint, paired device, or setup details.",
          },
          {
            key: "caseOrAccessories",
            label: "Case / Accessories",
            type: "text",
            required: false,
            placeholder: "Optional - case, charger, sleeve, stickers, adapter, etc.",
          },
          {
            key: "serialNumberOrDeviceId",
            label: "Serial Number / Device ID",
            type: "text",
            required: false,
            placeholder: "Optional",
          },
        ],
      }
    }

    if (isStorageElectronicType(electronicItemType)) {
      return {
        heading: "Group A: Electronics & Storage Media",
        fields: [
          {
            key: "brandOrModel",
            label: "Brand / Model",
            type: "text",
            required: true,
            placeholder: "e.g., SanDisk Ultra, Kingston, Seagate 1TB",
          },
          {
            key: "capacityOrLabel",
            label: "Capacity / Label Details",
            type: "text",
            required: true,
            placeholder: "e.g., 64GB, blue label, project-name sticker",
          },
          {
            key: "distinctivePhysicalFeatures",
            label: "Distinctive Physical Features",
            type: "textarea",
            required: true,
            placeholder: "Describe scratches, stickers, case marks, or other visible identifiers.",
          },
          {
            key: "contentsHint",
            label: "File / Folder Hint",
            type: "text",
            required: false,
            placeholder: "Optional - name a non-sensitive folder or file only",
            prompt: "For safety, do not list passwords or private contents.",
          },
        ],
      }
    }

    const fields: DynamicFieldConfig[] = [
      {
        key: "brandOrModel",
        label: "Brand / Model",
        type: "text",
        required: true,
        placeholder: "e.g., Logitech, ROG, Casio, Lenovo, Anker",
      },
      {
        key: "distinctivePhysicalFeatures",
        label: "Distinctive Physical Features",
        type: "textarea",
        required: true,
        placeholder: "Describe visible marks, stickers, scratches, accessories, custom details, or wear.",
      },
      {
        key: "includedAccessories",
        label: "Included Accessories",
        type: "text",
        required: false,
        placeholder: "Optional - dongle, cable, case, adapter, receiver, keycap puller, etc.",
      },
      {
        key: "serialNumberOrDeviceId",
        label: "Serial Number / Device ID",
        type: "text",
        required: false,
        placeholder: "Optional",
      },
    ]

    if (context.collectElectronicItemType) {
      fields.unshift({
        key: "electronicItemType",
        label: "Electronic Item Type",
        type: "select",
        required: true,
        options: ELECTRONIC_ITEM_TYPES,
      })
    }

    return {
      heading: "Group A: Electronics & Tech",
      fields,
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
          key: "externalPattern",
          label: "External Pattern / Material",
          type: "select",
          required: true,
          options: ["Solid", "Striped", "Patterned", "Leather", "Canvas", "Other"],
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
          key: "walletMaterial",
          label: "Wallet Material",
          type: "select",
          required: true,
          options: ["Leather", "Canvas", "Nylon", "Metal", "Plastic", "Other"],
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
          key: "material",
          label: "Material",
          type: "select",
          required: true,
          options: ["Gold", "Silver", "Leather", "Rose Gold", "Metal", "Other"],
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

export const ELECTRONIC_ITEM_TYPES = [
  "Phone",
  "Laptop",
  "Tablet",
  "Keyboard",
  "Mouse",
  "Webcam",
  "Earbuds / Headphones",
  "Charger / Adapter / Cable",
  "Calculator",
  "USB / Storage Media",
  "Speaker",
  "Controller / Remote",
  "Smart Watch",
  "Other",
] as const

function normalizeElectronicItemType(value?: string | null): string {
  return (value ?? "").trim().toLowerCase()
}

function isPersonalElectronicType(value: string): boolean {
  return ["phone", "laptop", "tablet", "smart watch"].some((term) => value.includes(term))
}

function isStorageElectronicType(value: string): boolean {
  return value.includes("usb") || value.includes("storage") || value.includes("drive") || value.includes("media")
}
