**Title:** The Hive Manager: Imkerei Ruder PoC

**Short Summary:**
A Next.js web application for "Imkerei Ruder" to manage bee colonies (Völker), hive components (Zargen, etc.) using NFC tags, track inspections, treatments, and harvests. The core UI features a dynamic, interactive visual stack of hive components.

**Long, Detailed Description:**
"The Hive Manager" aims to digitize and streamline beekeeping records for Imkerei Ruder. This Proof of Concept will focus on a single apiary. The system will allow the beekeeper to maintain detailed records for each bee colony (Volk), including queen information, colony strength, and history.

A key innovation is the use of NFC tags attached to hive components (initially Zargen, potentially Böden/Deckel later). Scanning an NFC tag with a smartphone will lead directly to a URL like `your-domain.de/view/z123`, displaying all relevant information for that specific Zarge (e.g., number of drone frames, honey frames, last cleaning date).

The user interface will prominently feature a **Visual Hive Stack**. This interactive SVG illustration will be displayed on colony and component view pages. It will represent the current physical configuration of a hive (Deckel, Zargen, Boden). Hovering over a component in the stack will visually expand it, and clicking will navigate to that component's specific detail page (e.g., `/view/z123`) or, if on a component page, highlight it within the context of its parent colony. A clear link (e.g., `#f123`) above the stack will always navigate to the associated colony's main view.

Management views (`/manage/...`) will utilize a similar visual stack for intuitive component management (adding/removing Zargen from a colony). The system will also support detailed logging for colony inspections, treatments/feeding, and honey harvests, with dedicated forms and historical views.

The application will be built using Next.js (App Router), Shadcn/UI for the component library, and Framer Motion (or Motion One) for animations, ensuring a modern, responsive, and performant experience. For this PoC, data will be structured according to the provided schemas, focusing on Völker, Zargen, Inspektionen, Behandlungen, and Ernten.

**Enhancements & Considerations:**
1.  **NFC ID Scheme:** The IDs like `f123` (Familie/Volk) and `z123` (Zarge) are good. The application will need to differentiate these, likely by the prefix character (`f`, `z`, `b` for Boden, `d` for Deckel). This allows a single `[id]` dynamic segment in routes.
2.  **Component Tracking (Deckel, Boden):** While `Zargenverwaltung` is detailed, for Deckel (roofs) and Böden (bottom boards) to be individually clickable in the stack and have their own pages (e.g., `/view/d456`), they'll need their own (potentially simpler) data models and database tables. For the PoC, we can:
    *   Option A (Simpler): Focus NFC tracking on Zargen. Deckel/Boden are selected types when configuring a hive stack but don't have individual NFC-linked pages. Clicking them in the stack might show generic info or be non-interactive.
    *   Option B (More Complete for UI): Define simple schemas for Deckel and Boden, allowing them to have unique IDs (e.g., `d456`, `b789`) and basic tracked properties. This aligns better with the full visual stack interaction.
    I'll proceed with page descriptions assuming Option B is the long-term goal, but Zargen are the primary focus for detailed data in the PoC.
3.  **Dashboard:** A central dashboard (`/`) for Imkerei Ruder, showing an overview, upcoming tasks (e.g., next planned inspections), and quick stats.
4.  **Queen Birth Date:** The schema specifies "Geburtsjahr" (YYYY), but you mention "woche.jahr" with a Shadcn datepicker. The UI can use a datepicker, but the stored data format should be consistent. Storing the full date (`YYYY-MM-DD`) offers more flexibility for future calculations (e.g., queen age) and can still be displayed as "week.year". I'll use the provided Zod schema for now.

**List/Tree of (Next.js) Routes:**

*   `/(auth)` - Authentication Provider (For PoC, could be very simple or mock auth for a single user)
*   `/` - Dashboard: Overview for Imkerei Ruder.
*   `/[id]` - Catch-all for NFC-tag IDs (e.g., `z123`, `f123`). Redirects to `/view/[id]`.
*   `/view/[entityId]` - View page for a specific entity (Volk, Zarge, Boden, Deckel).
    *   `entityId` examples: `f-volk001`, `z-zarge087`, `b-boden003`, `d-deckel005`.
    *   Logic within the page will determine entity type based on `entityId` prefix or by querying the backend.
*   `/manage/dashboard` - Main management overview, potentially listing all colonies. (Corresponds to user's `/manage - alle familien`)
*   `/manage/colony/[colonyId]/settings` - Page to manage a colony's overall settings and its hive component stack (add/remove Zargen, select Deckel/Boden types).
*   `/manage/components` - Inventory list of all Zargen, Böden, Deckel.
    *   `/manage/components/new` - Form to add a new component (Zarge, Boden, Deckel) to inventory.
    *   `/manage/components/[componentId]/edit` - Edit details of an existing component.
*   `/colonies/new` - Form to create/register a new bee colony (Volk).
*   `/inspections/new/[colonyId]` - Form to create a new inspection record for the specified colony.
*   `/inspections/[inspectionId]` - View details of a specific inspection.
*   `/inspections/[inspectionId]/edit` - Form to edit an existing inspection.
*   `/harvests/new/[colonyId]` - Form to record a new honey harvest for the specified colony.
*   `/harvests/[harvestId]` - View details of a specific harvest.
*   `/harvests/[harvestId]/edit` - Form to edit an existing harvest record.
*   `/treatments/new/[colonyId]` - Form to record a new treatment or feeding for the specified colony.
*   `/treatments/[treatmentId]` - View details of a specific treatment/feeding.
*   `/treatments/[treatmentId]/edit` - Form to edit an existing treatment/feeding record.
*   *(Optional for PoC)* `/breeding` - Overview of queen breeding activities.
    *   `/breeding/series/[seriesId]` - Details of a specific breeding series.
    *   `/breeding/series/new` - Form to start a new breeding series.

**Detailed Description of What Each Page Should Contain:**

*   **`/` (Dashboard):**
    *   Welcome message for "Imkerei Ruder".
    *   Summary statistics: Total colonies, overall health indication (if calculable), total honey harvested this season (concept).
    *   Quick links: "Add New Colony", "Log Inspection", "Log Harvest".
    *   List of recent activities or alerts (e.g., "Colony f-003 due for inspection").

*   **`/[id]` (NFC Redirector):**
    *   Server-side logic to parse the `id`.
    *   Determines if `id` corresponds to a colony (`f-...`), zarge (`z-...`), boden (`b-...`), or deckel (`d-...`).
    *   Performs a `redirect` to the appropriate `/view/[id]` URL.

*   **`/view/[entityId]`:**
    *   **If `entityId` is a Colony (e.g., `f-volk001`):**
        *   **Visual Hive Stack Component:** Prominently displayed, showing Deckel, Zargen (linking to `Zargenverwaltung` records), Boden. Hovering expands a component, clicking navigates to its `/view/[componentId]` page. The stack is built based on the colony's current configuration.
        *   **Colony Details Section:** Information from `Völkerübersicht` table (Standort, Beutentyp, Königin details, Volksstärke, etc.). Use Shadcn components for display (e.g., `Card`, `DescriptionList`).
        *   **Tabs/Sections for:**
            *   **Inspections:** Chronological list of inspections (from `Völkerdurchsicht`). Each item links to `/inspections/[inspectionId]`. Button to "Log New Inspection" (`/inspections/new/[colonyId]`).
            *   **Treatments/Feeding:** List of treatments (from `Behandlungen & Fütterung`). Link to `/treatments/[treatmentId]`. Button to "Log New Treatment" (`/treatments/new/[colonyId]`).
            *   **Harvests:** List of harvests (from `Honigernte`). Link to `/harvests/[harvestId]`. Button to "Log New Harvest" (`/harvests/new/[colonyId]`).
            *   **(Optional) Breeding Info:** If this colony is involved in breeding.
        *   Link to `/manage/colony/[colonyId]/settings`.
    *   **If `entityId` is a Zarge (e.g., `z-zarge087`):**
        *   **Visual Hive Stack Component:** Displayed, with the current Zarge highlighted. The `#f[ID]` link above navigates to the parent colony if assigned.
        *   **Zarge Details Section:** Information from `Zargenverwaltung` (Zargentyp, Rähmchenmaß, Anzahl Rähmchen, Zustand, Letzte Reinigung, etc.).
        *   Information if currently assigned to a colony (and which one, linking to `/view/f-[colonyId]`).
        *   History of usage (e.g., past colonies it was part of - advanced feature).
        *   Quick Stats: Drone frames, honey frames, last washed.
        *   Link to `/manage/components/[componentId]/edit`.
    *   **If `entityId` is a Boden/Deckel (e.g., `b-boden003`, `d-deckel005`):** (Assuming Option B for component tracking)
        *   **Visual Hive Stack Component:** Similar to Zarge view, highlighting the Boden/Deckel.
        *   **Component Details:** Type, material, last cleaned, current colony assignment.
        *   Link to `/manage/components/[componentId]/edit`.

*   **`/manage/dashboard`:**
    *   List of all colonies ("Völker") for Imkerei Ruder. Each item shows key info (ID, Standort, Königin status, current strength) and links to `/view/f-[colonyId]` and `/manage/colony/[colonyId]/settings`.
    *   Button: "Add New Colony" (`/colonies/new`).

*   **`/manage/colony/[colonyId]/settings`:**
    *   **Visual Hive Stack Component (Interactive):** Allows adding/removing/reordering Zargen from the colony's stack. Zargen are chosen from the available inventory (`/manage/components`). Allows selecting Deckel and Boden types for the colony.
    *   Form to edit general colony details from `Völkerübersicht`.
    *   "Save Changes" button.

*   **`/manage/components`:**
    *   Table/list of all Zargen, Böden, Deckel in inventory.
    *   Columns: ID, Type (Zarge, Boden, Deckel), Sub-Type (Brutraum, Honigraum, Flachzarge, etc.), Status (In use at Volk X, In Storage), Last Cleaned.
    *   Filters for type, status.
    *   Each item links to `/view/[componentId]` and `/manage/components/[componentId]/edit`.
    *   Button: "Add New Component" (`/manage/components/new`).

*   **`/manage/components/new` & `/manage/components/[componentId]/edit`:**
    *   Form based on `Zargenverwaltung` schema (adapted if it becomes a generic component table). For PoC, focus on Zargen.
    *   Fields: Zargen-ID (potentially auto-generated or based on NFC input), Zargentyp, Rähmchenmaß, Anzahl Rähmchen (Max), Herkunft/Kaufdatum, Zustand, Letzte Reinigung/Desinfektion, Lagerort, Bemerkungen.
    *   Use Shadcn form components, select inputs for enums, date pickers.

*   **`/colonies/new`:**
    *   Form based on `Völkerübersicht` schema.
    *   Fields for Volks-ID, Standort, Beutentyp, Königin details, initial Volksstärke, etc.
    *   Shadcn Datepicker for "Königin - Geburtsjahr" (as per your note, though schema is YYYY). Consider storing full date and formatting as week.year if needed.
    *   "Save Colony" button.

*   **`/inspections/new/[colonyId]` & `/inspections/[inspectionId]/edit`:**
    *   Form based on `Völkerdurchsicht` schema.
    *   Fields for Datum, Wetter, Volksstärke, Königin gesehen, Stifte, Larven, Verdeckelte Brut, Weiselzellen, etc.
    *   Use of complex object fields for Wetter, Verdeckelte Brut. Arrays for Weiselzellen, Durchgeführte Arbeiten.
    *   Utilize Shadcn `Input`, `Checkbox`, `Select`, `Textarea`, `DatePicker`. For arrays like "Durchgeführte Arbeiten", allow dynamic adding/removing of items.
    *   "Save Inspection" button.

*   **`/inspections/[inspectionId]`:**
    *   Read-only view of an inspection's details, clearly formatted.
    *   Link to associated colony `/view/f-[colonyId]`.
    *   "Edit Inspection" button linking to `/inspections/[inspectionId]/edit`.

*   **`/harvests/new/[colonyId]` & `/harvests/[harvestId]/edit`:**
    *   Form based on `Honigernte` schema.
    *   Fields: Datum, Art der Tracht, Anzahl entnommener Waben, Mengen, Wassergehalt.
    *   "Save Harvest" button.

*   **`/harvests/[harvestId]`:**
    *   Read-only view of a harvest's details.
    *   Link to associated colony.
    *   "Edit Harvest" button.

*   **`/treatments/new/[colonyId]` & `/treatments/[treatmentId]/edit`:**
    *   Form based on `Behandlungen & Fütterung` schema.
    *   Fields: Datum, Art, Grund/Krankheit, Mittel/Produkt, Menge, etc.
    *   "Save Treatment/Feeding" button.

*   **`/treatments/[treatmentId]`:**
    *   Read-only view of a treatment/feeding record.
    *   Link to associated colony.
    *   "Edit Treatment" button.

**Analytics (PostHog) and Feature Flags:**

*   **Default Provider:** PostHog
*   **Events to Track (with suggested tags):**
    *   `page_view`: For all page routes (e.g., `page_view_dashboard`, `page_view_colony_details`, `page_view_inspection_form`).
    *   `nfc_scan_redirect`: When `/[id]` redirects (tag: `entity_type_redirected` [colony, zarge]).
    *   `colony_created`: When a new colony is saved (tags: `colony_id`, `beehive_type`).
    *   `colony_updated`: When colony settings are saved.
    *   `component_added_to_inventory`: (tags: `component_id`, `component_type` [zarge, boden, deckel]).
    *   `component_updated`.
    *   `component_assigned_to_colony`: When a Zarge/component is added to a colony's stack.
    *   `component_removed_from_colony`.
    *   `inspection_logged`: (tags: `colony_id`, `queen_seen` [true/false]).
    *   `inspection_updated`.
    *   `harvest_logged`: (tags: `colony_id`, `harvest_type`, `honey_kg_estimated`).
    *   `harvest_updated`.
    *   `treatment_logged`: (tags: `colony_id`, `treatment_type`, `product_used`).
    *   `treatment_updated`.
    *   `visual_hive_stack_interaction`: (tags: `interaction_type` [hover, click], `component_type_interacted` [zarge, deckel, boden], `target_page` [if click]).
*   **Feature Flags (using PostHog):**
    *   `enableQueenBreedingModule`: To toggle the entire "Zucht" (Queen Breeding) section/routes if you decide to implement it later.
    *   `showAdvancedComponentStats`: For potentially more detailed analytics on component pages.
    *   `enableGoogleSheetsExport`: If you implement the "In Google Sheets exportieren" feature.

**TypeScript Type Definitions (from Zod Schemas):**
Here are the TypeScript interfaces based on your Zod schemas.
*(Note: For `Varroakontrolle - Ergebnis`, the regex in your input was incomplete. I've used `string`. You'll need to define the exact format or use a more complex object if parsing specific numbers from it.)*

```typescript
// I. Völkerübersicht (Bee Colony Overview)
export type BeuteTypOption =
  | { typ: 'Dadant US' }
  | { typ: 'Dadant Blatt' }
  | { typ: 'Zander' }
  | { typ: 'Langstroth' }
  | { typ: 'Deutsch Normalmaß (DNM)' }
  | { typ: 'MiniPlus' }
  | { typ: 'Warré' }
  | { typ: 'Einraumbeute' }
  | { typ: 'Sonstiges'; beschreibung: string };

export type KoeniginGezeichnetEnum =
  | 'Weiß (Jahr endet auf 1 od. 6)'
  | 'Gelb (Jahr endet auf 2 od. 7)'
  | 'Rot (Jahr endet auf 3 od. 8)'
  | 'Grün (Jahr endet auf 4 od. 9)'
  | 'Blau (Jahr endet auf 5 od. 0)'
  | 'Nicht gezeichnet'
  | 'Unbekannt';

export interface KoeniginEigenschaften {
  sanftmut: '1_sehr_sanft' | '2_sanft' | '3_normal' | '4_stechlustig' | '5_sehr_stechlustig';
  schwarmneigung: '1_sehr_gering' | '2_gering' | '3_mittel' | '4_stark' | '5_sehr_stark';
  wabensitz: '1_sehr_ruhig' | '2_ruhig' | '3_normal' | '4_laeuferisch' | '5_sehr_laeuferisch';
  legeleistung_eindruck: '1_schwach' | '2_unterdurchschnittlich' | '3_durchschnittlich' | '4_gut' | '5_sehr_gut';
  honigleistung_eindruck?: '1_schwach' | '2_unterdurchschnittlich' | '3_durchschnittlich' | '4_gut' | '5_sehr_gut';
  krankheitsanfaelligkeit_eindruck?: 'gering' | 'mittel' | 'hoch';
  sonstige_eigenschaften?: string;
}

export type VolksstaerkeAktuellOption =
  | { typ: 'Wabengassen'; anzahl: number }
  | { typ: 'Skala_1_5'; wert: '1_sehr_schwach' | '2_schwach' | '3_mittel' | '4_stark' | '5_sehr_stark' }
  | {
      typ: 'Zargenanzahl_und_Besetzung';
      brutraumzargen: number;
      honigraumzargen: number;
      besetzung_br?: string;
      besetzung_hr?: string;
    }
  | { typ: 'Freitext'; beschreibung: string };

export interface ColonyOverview {
  id: string; // Volks-ID
  standort: string;
  beutentyp: BeuteTypOption;
  koenigin_herkunft: string;
  koenigin_geburtsjahr: string; // YYYY format
  koenigin_gezeichnet: KoeniginGezeichnetEnum;
  koenigin_eigenschaften: KoeniginEigenschaften;
  volksstaerke_aktuell: VolksstaerkeAktuellOption;
  erstellt_am: string; // YYYY-MM-DD
  aufgeloest_am?: string; // YYYY-MM-DD
  bemerkungen?: string;
  // For visual stack - to be defined based on how Deckel/Boden/Zargen are structured
  // current_hive_stack: { deckel: DeckelType | DeckelId, zargen: ZargeId[], boden: BodenType | BodenId }[];
}

// II. Völkerdurchsicht (Colony Inspection)
export interface Wetter {
  temperatur_celsius?: number;
  niederschlag?: 'kein' | 'Nieselregen' | 'leichter Regen' | 'Regen' | 'starker Regen' | 'Hagel' | 'Schnee';
  wind?: 'windstill' | 'leichte Brise' | 'mäßiger Wind' | 'starker Wind' | 'Sturm';
  bewoelkung?: 'sonnig' | 'leicht bewölkt' | 'wolkig' | 'stark bewölkt' | 'bedeckt';
  luftfeuchtigkeit_prozent?: number;
}

export type VolksstaerkeDurchsichtOption =
  | { typ: 'Wabengassen_besetzt'; anzahl: number }
  | { typ: 'Brutwaben_Anzahl'; anzahl_offen: number; anzahl_verdeckelt: number }
  | { typ: 'Futterwaben_Anzahl'; anzahl: number }
  | { typ: 'Skala_1_5'; wert: '1_sehr_schwach' | '2_schwach' | '3_mittel' | '4_stark' | '5_sehr_stark' }
  | { typ: 'Freitext'; beschreibung: string };

export interface VerdeckelteBrut {
  vorhanden: boolean;
  anzahl_waben?: number;
  flaeche_pro_wabe_avg_prozent?: number;
  qualitaet_brutnest?: 'sehr gut' | 'gut' | 'lückig' | 'schlecht';
  bemerkung?: string;
}

export interface Weiselzelle {
  anzahl: number;
  art: 'Schwarmzelle' | 'Nachschaffungszelle' | 'Spielnäpfchen' | 'Stille Umweiselungszelle';
  zustand:
    | 'offen (unbestiftet)'
    | 'bestiftet'
    | 'Made sichtbar'
    | 'verdeckelt'
    | 'geschlüpft'
    | 'ausgefressen'
    | 'zerstört';
}

export type DurchgefuehrteArbeitOption =
  | { arbeit: 'Honigraum_aufgesetzt'; anzahl: number; typ?: string; mit_absperrgitter?: boolean }
  | { arbeit: 'Honigraum_abgenommen'; anzahl: number }
  | { arbeit: 'Erweitert_Mittelwand'; anzahl: number; position?: string }
  | { arbeit: 'Erweitert_Ausgebaute_Wabe'; anzahl: number; position?: string }
  | { arbeit: 'Wabenhygiene'; art: 'Altwaben_entfernt' | 'Waben_umgehängt'; anzahl?: number }
  | { arbeit: 'Ableger_erstellt'; typ?: string; brutwaben: number; futterwaben: number; bienenmasse?: string }
  | { arbeit: 'Schwarmkontrolle' }
  | { arbeit: 'Weiselzellen_gebrochen'; anzahl: number }
  | { arbeit: 'Gefuettert'; mittel: string; menge_kg_liter: number }
  | { arbeit: 'Behandelt_Varroa'; mittel: string; methode: string }
  | { arbeit: 'Sonstiges'; beschreibung: string };

export interface ColonyInspection {
  id: string; // Durchsicht-ID
  colonyId: string; // Volks-ID
  datum: string; // YYYY-MM-DD
  wetter?: Wetter;
  volksstaerke: VolksstaerkeDurchsichtOption;
  koenigin_gesehen: boolean;
  stifte_vorhanden: boolean;
  larven_vorhanden: boolean;
  verdeckelte_brut: VerdeckelteBrut;
  weiselzellen?: Weiselzelle[];
  drohnenbrut: 'Normal' | 'Viel' | 'Wenig' | 'Buckelbrütig' | 'Keine vorhanden' | 'Nicht geprüft';
  futtervorrat: 'Ausreichend' | 'Viel' | 'Normal' | 'Knapp' | 'Leer' | 'Nicht geprüft';
  pollenvorrat: 'Ausreichend' | 'Viel' | 'Normal' | 'Knapp' | 'Leer' | 'Nicht geprüft';
  verhalten: 'Sanftmütig' | 'Ruhig' | 'Nervös' | 'Läuferisch' | 'Stechlustig' | 'Verteidigungsbereit';
  krankheitsanzeichen: string;
  varroakontrolle_methode:
    | 'Gemülldiagnose (Bodenschieber)'
    | 'Puderzuckermethode'
    | 'Auswaschmethode'
    | 'Bannwabenverfahren'
    | 'Drohnenbrutschnitt'
    | 'Keine durchgeführt'
    | 'Sichtkontrolle';
  varroakontrolle_ergebnis: string; // User provided incomplete regex, using string. Example: "5 Milben / Tag" or "5 M / 3 d"
  durchgefuehrte_arbeiten: DurchgefuehrteArbeitOption[];
  naechste_kontrolle_massnahme: string;
  bemerkungen?: string;
}

// III. Zargenverwaltung (Hive Component Management - specific to Zargen for now)
export type ZargentypEnum =
  | 'Brutraum'
  | 'Honigraum'
  | 'Halbzarge'
  | 'Flachzarge'
  | 'Futterzarge'
  | 'Baurahmenzarge'
  | 'MiniPlus-Zarge'
  | 'Sonstiges'; // If Sonstiges, consider adding a beschreibung field

export type RaehmchenmassEnum =
  | 'Zander'
  | 'Dadant Brut'
  | 'Dadant Honig'
  | 'DNM (Deutsch Normalmaß)'
  | 'Langstroth'
  | 'MiniPlus'
  | 'Sonstiges'; // If Sonstiges, consider adding a beschreibung field

export type ZargeZustandEnum =
  | 'Neu'
  | 'Gut'
  | 'Gebraucht'
  | 'Abgenutzt'
  | 'Reparaturbedürftig'
  | 'Desinfiziert'
  | 'Wachsreste';

export interface HiveComponent { // Primarily for Zargen based on table
  id: string; // Zargen-ID (e.g., z-123)
  colonyId_zuordnung?: string; // Volks-ID (optional)
  zargentyp: ZargentypEnum;
  raehmchenmass: RaehmchenmassEnum;
  anzahl_raehmchen_max: number;
  aktuell_im_einsatz_seit?: string; // YYYY-MM-DD
  herkunft_kaufdatum: string;
  zustand: ZargeZustandEnum;
  letzte_reinigung_desinfektion?: string; // YYYY-MM-DD
  lagerort?: string;
  bemerkungen?: string;
  // If this becomes generic for Boden/Deckel, add a mainType: 'Zarge' | 'Boden' | 'Deckel'
}

// IV. Behandlungen & Fütterung (Treatments & Feeding)
export type BehandlungArtEnum =
  | 'Behandlung Varroa'
  | 'Behandlung Sonstige'
  | 'Einfütterung Winter'
  | 'Reizfütterung Frühjahr'
  | 'Reizfütterung Ableger'
  | 'Notfütterung'
  | 'Sonstige Fütterung';

export interface TreatmentFeeding {
  id: string; // Behandlungs-ID
  colonyId: string; // Volks-ID or 'Alle Völker'
  datum: string; // YYYY-MM-DD
  art: BehandlungArtEnum;
  grund_krankheit: string;
  mittel_produkt: string;
  charge?: string;
  konzentration_menge: string;
  anwendungsmethode: string;
  wartezeit: string; // e.g., "42 Tage", "0 Tage", "N/A"
  behandelnde_person: string;
  lieferant_des_mittels?: string;
  tierarzt?: string;
  erfolgskontrolle_datum?: string; // YYYY-MM-DD
  erfolgskontrolle_ergebnis?: string;
  bemerkungen?: string;
}

// V. Honigernte (Honey Harvest)
export type TrachtArtEnum =
  | 'Frühtracht' | 'Raps' | 'Linde' | 'Sommerblüte allgemein' | 'Waldhonig' | 'Phacelia'
  | 'Sonnenblume' | 'Akazie' | 'Kornblume' | 'Heide' | 'Klee' | 'Obstblüte'
  | 'Löwenzahn' | 'Buchweizen' | 'Edelkastanie' | 'Sonstiges';

export interface HoneyHarvest {
  id: string; // Ernte-ID
  colonyId: string; // Volks-ID
  datum: string; // YYYY-MM-DD
  art_der_tracht: TrachtArtEnum;
  anzahl_entnommener_waben: number;
  geschaetzte_menge_vor_schleudern_kg?: number;
  tatsaechliche_menge_nach_schleudern_kg?: number;
  wassergehalt_prozent?: number;
  bemerkungen?: string;
}

// VI. Zucht (Queen Breeding) - Optional
export type BegattungArtEnum = 'Belegstelle' | 'Standbegattet' | 'Instrumentell besamt';

export interface QueenBreedingSeries {
  id: string; // Zuchtserie-ID
  muttervolkId: string; // Volks-ID
  datum_umlarven: string; // YYYY-MM-DD
  anzahl_umgelarvter_zellen: number;
  anzahl_angenommener_zellen: number;
  pflegevolkIds: string; // Comma-separated or array
  erwartetes_schlupfdatum: string; // YYYY-MM-DD
  tatsaechliches_schlupfdatum?: string; // YYYY-MM-DD
  anzahl_geschluepfter_koeniginnen: number;
  // This part might need to be an array if one series produces multiple queens tracked individually
  begattungseinheitId: string; // EWK/Apidea
  begattungsart: BegattungArtEnum;
  belegstelle_name?: string;
  datum_einweiselung_koenigin?: string; // YYYY-MM-DD
  zielvolkId?: string; // Volks-ID
  begattungserfolg_in_eilage?: boolean;
  neue_koeniginId: string; // Unique ID for the new queen
  bemerkungen_zucht?: string;
}
```

**Information-Packed V0 Prompt:**

```text
Design a Next.js web application frontend called "The Hive Manager" for beekeeping, specifically a Proof of Concept for a single apiary "Imkerei Ruder".
Use Shadcn/UI components and Framer Motion for subtle animations. The app should be clean, modern, data-focused, and responsive.

Key Feature: Interactive SVG Visual Hive Stack. This component displays a bee hive (Deckel/roof, Zargen/boxes, Boden/bottom-board) stacked vertically. On hover, individual components in the stack expand slightly. Clicking a component navigates to its detail page. A text link like "#f123" (family ID) is always visible above the stack, linking to the parent colony's view.

Routes & Pages:
1.  `/` (Dashboard): Apiary overview (total colonies, alerts), quick links ("New Colony", "Log Inspection").
2.  `/view/[entityId]` (View Entity):
    *   If entity is a Colony (e.g., `f-volk001`): Show Visual Hive Stack. Display colony details (location, hive type, queen info). Tabs for: Inspections list, Treatments list, Harvests list. Each list item links to its detail page. Buttons to add new entries.
    *   If entity is a Hive Component (e.g., Zarge `z-zarge087`): Show Visual Hive Stack with this component highlighted. Display component details (type, frames, cleaning status, NFC ID). Show parent colony if assigned.
3.  `/manage/dashboard`: List of all colonies (cards or table) with key info, linking to view/manage pages. Button "Add New Colony".
4.  `/manage/colony/[colonyId]/settings`: Edit colony details. Interactive Visual Hive Stack for adding/removing/reordering Zargen from inventory, selecting Deckel/Boden types.
5.  `/manage/components`: Inventory list/table of all Zargen (and potentially Böden, Deckel). Columns: ID, Type, Status. Filters. Links to view/edit. Button "Add New Component".
6.  Forms (using Shadcn components like Input, Select, DatePicker, Checkbox, Textarea):
    *   `/colonies/new`: Create new colony.
    *   `/manage/components/new` & `/manage/components/[componentId]/edit`: Add/Edit Zarge (type, frame count, purchase date, cleaning status).
    *   `/inspections/new/[colonyId]` & `/inspections/[inspectionId]/edit`: Log/Edit colony inspection (date, weather, queen seen, brood status, tasks performed).
    *   `/harvests/new/[colonyId]` & `/harvests/[harvestId]/edit`: Log/Edit honey harvest (date, forage type, quantity).
    *   `/treatments/new/[colonyId]` & `/treatments/[treatmentId]/edit`: Log/Edit treatment/feeding (date, type, product, dosage).
7.  Read-only detail pages for individual inspections, harvests, treatments.

NFC Integration Concept: Physical NFC tags on hive components link to `/view/[componentNfcId]`.

Prioritize a clear information hierarchy and intuitive navigation. Left sidebar navigation could be suitable.
Example data for display:
- Zarge: ID 'z123', Type 'Honey Super', Frames '10', Drone Frames '2', Honey Frames '8', Last Washed '2023-03-15'.
- Colony: ID 'f001', Queen 'Marked Blue (2020)', Strength 'Strong (8 frames)'.
Visual Stack should clearly differentiate Deckel, Zarge (Brutraum/Honigraum type by color/label), Boden.
```