# Public Gallery & Search UI Specification
**Feature Path:** `/src/features/gallery`
**Target User:** Students / General Campus Population
**Core Objective:** Allow users to rapidly filter through turned-in items without exposing sensitive visual data of high-value goods.

## 1. The Core User Process (The "Happy Path")
This is the exact sequence a student follows when they realize they lost an item:

1. **Land on Entry Portal:** User opens the ReClaim web app and is presented with the landing page containing the Login Form, "View Found Items", and "Report Lost Item" buttons.
2. **Navigate to Gallery:** User clicks the "View Found Items" button to enter the public catalog.
3. **Filter & Search:** User utilizes to narrow down results by date, category, or building.
4. **Visual Identification:** - *Low-Value Item:* User sees the actual photo of the item on the card.
   - *High-Value Item:* User sees a generic icon (e.g., Laptop icon) but matches the date/location metadata.
5. **Trigger Claim:** User clicks "Claim This Item" on the specific card.
6. **Blind Verification Form:** User fills out the modal with specific, hidden proof of ownership (e.g., lock screen wallpaper, MAC address).
7. **Confirmation:** System switches item state to `Claim Pending` and user awaits email instructions.

---

## 2. The Sidebar UI Component (`GalleryFilters.tsx`)
The sidebar must be sticky (stays on screen when scrolling the grid) and manage the filtering state of the main gallery. 

### Essential Filter Modules (Top to Bottom)

**A. Keyword Search (The Quick Filter)**
* **UI Element:** Text `<Input />` with a magnifying glass icon.
* **Function:** Searches the item title and general description.
* **UX Tip:** Add a debouncer to the input so it doesn't query the database on every single keystroke.

**B. Date Lost (The Most Critical Filter)**
* **UI Element:** Radio buttons or a simple Date Picker dropdown.
* **Options:** Today, Last 7 Days, Last 30 Days, Custom Range.

**C. Category (The Broad Filter)**
* **UI Element:** Checkboxes (allow multiple selections).
* **Options:** Electronics, Wallets & IDs, Clothing & Accessories, Bags & Backpacks, Everyday Items.

**D. Campus Location (The Geography Filter)**
* **UI Element:** A searchable standard `<Select />` dropdown.
* **Options:** Populate with main campus buildings/zones.

**E. Filter Actions**
* **UI Element:** A subtle text button.
* **Label:** "Clear All Filters"
* **Function:** Resets all state back to default and shows the full, unfiltered gallery.