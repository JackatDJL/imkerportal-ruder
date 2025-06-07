**Title:** The Hive Manager: Imkerei Ruder - Enhanced PoC (Revised Routing)

**Short Summary:**
A Next.js web application for "Imkerei Ruder" to manage bee colonies and hive components, track inspections, treatments, and harvests. NFC tag scans (`/[id]`) redirect to type-specific live-editable detail pages (e.g., `/colonies/[id]`). Root type pages (e.g., `/colonies`) provide lists/grids of all entities of that type. The UI features a dynamic, interactive visual hive stack.

**Long, Detailed Description:**
"The Hive Manager" aims to digitize and streamline beekeeping records for Imkerei Ruder, focusing on a single apiary for this Proof of Concept. The system will allow beekeepers to maintain detailed records for each bee colony (Volk), including queen information, colony strength, and historical data.

A core innovation is the use of NFC tags attached to all hive components (Zargen, Böden, Deckel, etc.). Scanning an NFC tag with a smartphone will lead directly to a URL like `your-domain.de/f123` (for a colony) or `your-domain.de/z456` (for a Zarge). The `/[id]` catch-all route will interpret the ID's prefix and *redirect* the user to the appropriate type-specific detail page, such as `/colonies/f123` or `/components/z456`. These type-specific pages will serve as live-editable views, displaying all relevant information for the specific entity.

The user interface will prominently feature a **Visual Hive Stack**. This interactive SVG illustration will be displayed on colony and component pages. It will represent the current physical configuration of a hive (Deckel, Zargen, Boden, etc.). Hovering over a component in the stack will visually expand it, and clicking will navigate to that component's specific detail page (e.g., `/components/z123`). If on a component page, the component will be highlighted within the context of its parent colony. A clear link (e.g., `#f123`) above the stack will always navigate to the associated colony's main view.

The application will be built using Next.js (App Router), Shadcn/UI for the component library, and Framer Motion (or Motion One) for animations, ensuring a modern, responsive, and performant experience. Data will be structured according to the provided Convex schemas, focusing on `colonies`, `hiveComponents`, `colonyInspections`, `feedings`, `treatments`, and `honeyHarvests`. All data will be managed via unique, prefix-based identifiers for easy routing and data differentiation.

**Enhancements & Considerations:**
1.  **NFC ID Scheme & Redirection:** The `/[id]` dynamic route now acts as a redirection mechanism. It will parse the entity ID prefix (e.g., 'f' for colony, 'z' for Zarge) and redirect the user to the correct type-specific detail page (e.g., `/colonies/[id]`, `/components/[id]`). This maintains user-friendly NFC scanning while enforcing clear routing for entity management.
2.  **Type-Specific Root Pages:** New pages like `/colonies`, `/components`, `/inspections`, `/harvests`, and `/treatments` will provide a comprehensive list or grid view of all entities of that type, acting as central management hubs.
3.  **Live Editing:** All entity detail pages (e.g., `/colonies/[colonyId]`, `/components/[componentId]`) will feature live editing for authenticated users. This means fields will be editable in place, and changes will be persisted immediately (or after a short delay/explicit save action, depending on implementation).
4.  **Comprehensive Component Tracking:** The plan fully embraces tracking for all hive components (Zargen, Böden, Deckel, One Way Gates, Königinnenabsperrgitter, Futterräume) as per the schema, allowing each to have a unique ID and its own detail page.
5.  **Date Picker for Queen Birth Year:** The `queenBirthYear` in the schema is a string in `YYYY` format. The UI will use a Shadcn date picker, which can be configured to pick only the year or a full date and then format it to `YYYY` for storage, ensuring consistency.
6.  **Analytics and Feature Flags:** PostHog will be integrated for comprehensive analytics, tracking user interactions and page views, and feature flags will enable easy toggling of functionality.

**ID Construction and Rationale:**
Each entity in the system will have a unique identifier prefixed with a single letter representing its type, followed by a positive integer. This allows for:
* **Clear Identification:** Immediately recognize the type of entity from its ID (e.g., `f123` is a colony, `z123` is a Zarge).
* **Simplified NFC Routing:** A single `/[id]` dynamic route can handle all entity types by redirecting to the specific resource.
* **Human Readability:** Easy to remember and communicate IDs.
* **Scalability:** Allows for millions of records per entity type.

Examples:
* **Colonies:** `f123` (e.g., `f` for `Familie` / `Volk`)
* **Colony Inspections:** `v123` (e.g., `v` for `Völkerdurchsicht`)
* **Feedings:** `fa123` (e.g., `fa` for `Fütterungsaktion`)
* **Treatments:** `ta123` (e.g., `ta` for `Behandlungsaktion`)
* **Honey Harvests:** `h123` (e.g., `h` for `Honigernte`)
* **Zargen:** `z123` (e.g., `z` for `Zarge`)
* **Böden:** `b123` (e.g., `b` for `Boden`)
* **Deckel:** `d123` (e.g., `d` for `Deckel`)
* **One Way Gate:** `o123` (e.g., `o` for `One Way Gate`)
* **Königinnenabsperrgitter:** `k123` (e.g., `k` for `Königinnenabsperrgitter`)
* **Futterraum:** `fd123` (e.g., `fd` for `Futterraum`)

**List/Tree of (Next.js) Routes:**

* `/(auth)` - Authentication Provider
* `/` - Quick Dashboard: Overview for Imkerei Ruder (recent activities, quick stats).
* `/dashboard` - Full Overview Dashboard: Main management overview, listing all colonies and key statistics.
* `/[id]` - NFC Redirect Route: Catch-all for NFC-tag IDs (e.g., `f123`, `z456`). Redirects to the appropriate type-specific detail page (e.g., `/colonies/[id]`, `/components/[id]`).
* `/colonies` - Colony List/Grid: Displays all bee colonies.
    * `/colonies/[colonyId]` - Colony Detail Page (Live Edit): Displays and allows live editing of details for a specific colony.
    * `/colonies/new` - Form to create/register a new bee colony.
* `/components` - Component Inventory List/Grid: Displays all hive components (Zargen, Böden, Deckel, etc.).
    * `/components/[componentId]` - Component Detail Page (Live Edit): Displays and allows live editing of details for a specific component.
    * `/components/new` - Form to add a new hive component to inventory.
* `/inspections` - Inspection List/Grid: Displays all inspection records.
    * `/inspections/[inspectionId]` - Inspection Detail Page (Live Edit): Displays and allows live editing of a specific inspection.
    * `/inspections/new` - Select Colony for New Inspection: Page to choose a colony before creating a new inspection record.
    * `/inspections/new/[colonyId]` - Form to create a new inspection record for the specified colony.
* `/harvests` - Harvest List/Grid: Displays all honey harvest records.
    * `/harvests/[harvestId]` - Harvest Detail Page (Live Edit): Displays and allows live editing of a specific harvest.
    * `/harvests/new` - Select Colony for New Harvest: Page to choose a colony before recording a new harvest.
    * `/harvests/new/[colonyId]` - Form to record a new honey harvest for the specified colony.
* `/treatments` - Treatment List/Grid: Displays all treatment and feeding records.
    * `/treatments/[treatmentId]` - Treatment Detail Page (Live Edit): Displays and allows live editing of a specific treatment/feeding.
    * `/treatments/new` - Select Colony for New Treatment: Page to choose a colony before recording a new treatment/feeding.
    * `/treatments/new/[colonyId]` - Form to record a new treatment or feeding for the specified colony.

**Detailed Description of What Each Page Should Contain:**

* **`/` (Quick Dashboard):**
    * Welcome message for "Imkerei Ruder".
    * Summary statistics: Total colonies, overall health indication (if calculable), total honey harvested this season.
    * Quick links: "Add New Colony", "Log Inspection", "Log Harvest", "View Full Dashboard".
    * List of recent activities or alerts (e.g., "Colony f123 due for inspection").

* **`/dashboard` (Full Overview Dashboard):**
    * Comprehensive overview of all colonies, with cards or a table displaying key information (ID, Standort, Königin status, current strength). Each item links to `/[colonyId]`.
    * Overview statistics: Detailed breakdown of total colonies, average honey production, total inspections/treatments logged.
    * Visual representation of apiary health over time (optional, advanced).
    * Button: "Add New Colony" (`/colonies/new`).
    * Table/Summary of upcoming tasks (e.g., planned inspections, treatments).

* **`/[id]` (NFC Redirect Route):**
    * This page will contain client-side logic to extract the `id` from the URL, determine its type based on the prefix (e.g., 'f' for colony, 'z' for Zarge), and then programmatically redirect the user to the correct type-specific detail page (e.g., `/colonies/f123` or `/components/z456`).

* **`/colonies` (Colony List/Grid):**
    * A grid or table displaying all registered bee colonies.
    * Each item (card/row) shows: Colony ID, Location, Hive Type, Queen Status, Current Strength, and a link to its detail page (`/colonies/[colonyId]`).
    * Search and filter options (by location, hive type, queen status).
    * Button: "Add New Colony" (`/colonies/new`).

* **`/colonies/[colonyId]` (Colony Detail Page - Live Edit):**
    * **Visual Hive Stack Component:** Prominently displayed, showing Deckel, Zargen (linking to their `/[zID]` records), Boden, and other components. Hovering expands a component, clicking navigates to its `/[componentId]` page. The stack is built based on the colony's current configuration.
    * **Colony Details Section (Live Editable):** All information from `colonies` table (Standort, Beutentyp, Königin details, Volksstärke, etc.). Use Shadcn components for live editing (e.g., `Input`, `Select`, `DatePicker`). Save changes automatically or with a dedicated button.
    * **Interactive Hive Stack Management:** Within the colony details section, allow authenticated users to add/remove/reorder Zargen and other components from the colony's stack, selecting from available inventory.
    * **Tabs/Sections for:**
        * **Inspections:** Chronological list of inspections. Each item links to `/inspections/[inspectionId]`. Button to "Log New Inspection" (`/inspections/new/[colonyId]`).
        * **Treatments/Feeding:** List of treatments/feedings. Link to `/treatments/[treatmentId]`. Button to "Log New Treatment/Feeding" (`/treatments/new/[colonyId]`).
        * **Harvests:** List of harvests. Link to `/harvests/[harvestId]`. Button to "Log New Harvest" (`/harvests/new/[colonyId]`).

* **`/colonies/new`:**
    * Form based on `colonies` schema.
    * Fields for `identifier` (e.g., `f123`), `location`, `hiveType`, `queenOrigin`, `queenBirthYear` (using a Shadcn DatePicker configured for year selection), `queenMarked`, `queenTraits`, `currentStrength`, `createdAt`, `notes`.
    * "Save Colony" button.

* **`/components` (Component Inventory List/Grid):**
    * Table/list of all hive components in inventory (Zargen, Böden, Deckel, etc.).
    * Columns: ID, Type, Sub-Type (Brutraum, Honigraum, etc.), Status (In use at Volk X, In Storage), Last Cleaned.
    * Filters for type, status.
    * Each item links to `/components/[componentId]`.
    * Button: "Add New Component" (`/components/new`).

* **`/components/[componentId]` (Component Detail Page - Live Edit):**
    * **Visual Hive Stack Component:** Displayed, with the current component highlighted. The `#f[ID]` link above navigates to the parent colony if assigned.
    * **Component Details Section (Live Editable):** All information from `hiveComponents` schema relevant to the specific component type (Zargentyp, Rähmchenmaß, Anzahl Rähmchen, Zustand, Letzte Reinigung, etc. for a Zarge; Type, material, last cleaned, current colony assignment for Boden/Deckel/others).
    * Information if currently assigned to a colony (and which one, linking to `/colonies/[colonyId]`).
    * History of usage (e.g., past colonies it was part of - advanced feature).

* **`/components/new`:**
    * Form based on `hiveComponentTypes` schema.
    * Fields: `identifier` (e.g., `z123`, `b123`), `type` (dropdown), `frameSize`, `maxFrames`, `currentlyHolding`, `usedSince`, `condition`, `lastCleaned`, `location`, `notes`.
    * Use Shadcn form components, select inputs for enums, date pickers.
    * "Save Component" button.

* **`/inspections` (Inspection List/Grid):**
    * A table/list displaying all inspection records.
    * Each item shows: Inspection ID, Date, Target Colony (linking to `/colonies/[colonyId]`), Queen Seen, Strength, etc.
    * Search and filter options (by colony, date range, queen seen).
    * Button: "Log New Inspection" (`/inspections/new`).

* **`/inspections/[inspectionId]` (Inspection Detail Page - Live Edit):**
    * Live-editable view of an inspection's details.
    * All fields from `colonyInspections` schema displayed and editable.
    * Link to associated colony `/colonies/[colonyId]`.
    * "Delete Inspection" button.

* **`/inspections/new` (Select Colony for New Inspection):**
    * A simple page with a dropdown or search bar to select an existing colony.
    * Once a colony is selected, redirect to `/inspections/new/[colonyId]`.

* **`/inspections/new/[colonyId]`:**
    * Form based on `colonyInspections` schema, pre-filled with `targetColony`.
    * Fields for `date`, `weather`, `strength`, `sawQueen`, `broodPresent`, `larvaePresent`, `cappedBrood`, `queenBrood`, `droneBrood`, `foodStores`, `behavior`, `diseaseSigns`, `varroaControlMethod`, `varroaControlResult`, `actionsPerformed`, `nextInspectionDate`, `notes`.
    * Utilize Shadcn `Input`, `Checkbox`, `Select`, `Textarea`, `DatePicker`. For arrays like "Durchgeführte Arbeiten", allow dynamic adding/removing of items.
    * "Save Inspection" button.

* **`/harvests` (Harvest List/Grid):**
    * A table/list displaying all honey harvest records.
    * Each item shows: Harvest ID, Date, Target Colony (linking to `/colonies/[colonyId]`), Estimated Amount, Actual Amount, etc.
    * Search and filter options.
    * Button: "Log New Harvest" (`/harvests/new`).

* **`/harvests/[harvestId]` (Harvest Detail Page - Live Edit):**
    * Live-editable view of a harvest's details.
    * All fields from `honeyHarvests` schema displayed and editable.
    * Link to associated colony `/colonies/[colonyId]`.
    * "Delete Harvest" button.

* **`/harvests/new` (Select Colony for New Harvest):**
    * Similar to `/inspections/new`, allows selection of a colony before redirecting to `/harvests/new/[colonyId]`.

* **`/harvests/new/[colonyId]`:**
    * Form based on `honeyHarvests` schema, pre-filled with `targetColony`.
    * Fields: `identifier` (e.g., `h123`), `type`, `harvestDate`, `estimatedAmountPreExtractionKg`, `actualAmountPostExtractionKg`, `waterContentPercentage`, `notes`.
    * "Save Harvest" button.

* **`/treatments` (Treatment List/Grid):**
    * A table/list displaying all treatment and feeding records.
    * Each item shows: Treatment ID, Date, Target Colony (linking to `/colonies/[colonyId]`), Type (Treatment/Feeding), Product/Medium, etc.
    * Search and filter options.
    * Button: "Log New Treatment/Feeding" (`/treatments/new`).

* **`/treatments/[treatmentId]` (Treatment Detail Page - Live Edit):**
    * Live-editable view of a treatment/feeding record.
    * All fields from `treatments` or `feedings` schema displayed and editable.
    * Link to associated colony `/colonies/[colonyId]`.
    * "Delete Treatment/Feeding" button.

* **`/treatments/new` (Select Colony for New Treatment):**
    * Similar to `/inspections/new`, allows selection of a colony before redirecting to `/treatments/new/[colonyId]`.

* **`/treatments/new/[colonyId]`:**
    * Form based on `treatments` and `feedings` schema, allowing selection of treatment or feeding type. Pre-filled with `targetColony`.
    * For `treatments`: `identifier` (e.g., `ta123`), `type`, `reason`, `product`, `batch`, `concentration`, `applicationMethod`, `treatingPerson`, `supplier`, `veterinarian`, `note`.
    * For `feedings`: `identifier` (e.g., `fa123`), `medium`, `amountKgOrL`, `type` (regular/emergency), `reason` (if emergency), `targetFeedingFrame`.
    * "Save Treatment/Feeding" button.

**Analytics (PostHog) and Feature Flags:**

* **Default Provider:** PostHog
* **Events to Track (with suggested tags):**
    * `page_view`: For all page routes (e.g., `page_view_dashboard`, `page_view_colony_list`, `page_view_colony_details` [id, type], `page_view_form` [form_name]).
    * `nfc_scan_redirect`: When `/[id]` is accessed and redirects (tag: `entity_id`, `original_path`, `redirect_path`).
    * `entity_created`: When any new entity (colony, component, inspection, harvest, treatment/feeding) is saved (tags: `entity_id`, `entity_type`, specific relevant properties like `hive_type` for colony, `component_type` for component).
    * `entity_updated`: When an entity's details are saved/updated (tags: `entity_id`, `entity_type`, `fields_updated`).
    * `entity_deleted`: When an entity is deleted (tags: `entity_id`, `entity_type`).
    * `component_assigned_to_colony`: When a component is added to a colony's stack (tags: `colony_id`, `component_id`, `component_type`).
    * `component_removed_from_colony`: (tags: `colony_id`, `component_id`, `component_type`).
    * `visual_hive_stack_interaction`: (tags: `interaction_type` [hover, click], `component_type_interacted` [zarge, deckel, boden, etc.], `target_page` [if click], `source_page_colony_id`).
    * `form_submission_success`: For successful form submissions (tags: `form_name`, `entity_id` if created/updated).
    * `form_submission_failure`: For failed form submissions (tags: `form_name`, `error_message`).
* **Feature Flags (using PostHog):**
    * `showAdvancedAnalyticsDashboard`: To enable/disable more complex charts and statistics on the `/dashboard` page.
    * `enableGoogleSheetsExport`: If implementing a data export feature.
    * `enableNewUserOnboardingFlow`: For future onboarding sequence for new users.
