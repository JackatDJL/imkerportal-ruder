# The Hive Manager: Imkerei Ruder PoC

A Next.js web application for "Imkerei Ruder" to manage bee colonies (Völker), hive components (Zargen, etc.) using NFC tags, track inspections, treatments, and harvests. The core UI features a dynamic, interactive visual stack of hive components.

---

## Project Overview

"The Hive Manager" aims to digitize and streamline beekeeping records for Imkerei Ruder. This Proof of Concept will focus on a single apiary, providing a robust system for managing detailed records for each bee colony (Volk), including queen information, colony strength, and historical data.

A key innovation is the integration of **NFC tags** directly onto hive components (initially `Zargen`, with potential expansion to `Böden` and `Deckel`). Scanning an NFC tag with a smartphone will seamlessly navigate to a dedicated URL (e.g., `your-domain.de/view/z123`), displaying comprehensive information for that specific component.

The user interface will prominently feature a **Visual Hive Stack**. This interactive SVG illustration, displayed on colony and component view pages, will visually represent the current physical configuration of a hive (Deckel, Zargen, Boden). Users can hover over a component to visually expand it, and clicking will navigate to its specific detail page (e.g., `/view/z123`). When viewing a component's page, the stack will highlight that component within the context of its parent colony. A clear link (e.g., `#f123`) above the stack will always provide quick navigation to the associated colony's main view.

Management views (e.g., `/manage/...`) will leverage a similar visual stack for intuitive component management, allowing for easy addition or removal of `Zargen` from a colony. The system will also support detailed logging for colony inspections, treatments/feeding, and honey harvests, complete with dedicated forms and historical views.

This application will be built using **Next.js (App Router)**, **Shadcn/UI** for a modern component library, and **Framer Motion** (or Motion One) for smooth animations, ensuring a responsive and performant user experience. For this Proof of Concept, data will be structured based on provided schemas, primarily focusing on `Völker` (colonies), `Zargen` (supers), `Inspektionen` (inspections), `Behandlungen` (treatments), and `Ernten` (harvests).

---

## Enhancements & Considerations

1.  **NFC ID Scheme:** The proposed IDs like `f123` (Familie/Volk) and `z123` (Zarge) are effective. The application will differentiate entity types using the prefix character (`f` for colony, `z` for Zarge, `b` for Boden, `d` for Deckel). This allows for a streamlined `[id]` dynamic segment in routes.

2.  **Component Tracking (Deckel, Boden):** While `Zargenverwaltung` is detailed, for `Deckel` (roofs) and `Böden` (bottom boards) to be individually clickable in the stack and have their own pages (e.g., `/view/d456`), they will require their own (potentially simpler) data models and database tables. For the PoC, we will assume **Option B**, defining simple schemas for `Deckel` and `Boden` to allow unique IDs and basic tracked properties. This aligns best with the goal of a fully interactive visual hive stack, although `Zargen` will remain the primary focus for detailed data in the PoC.

3.  **Dashboard (`/`):** A central dashboard will provide an overview for Imkerei Ruder, featuring key statistics, upcoming tasks (e.g., next planned inspections), and quick summaries.

4.  **Queen Birth Date:** The schema specifies "Geburtsjahr" (YYYY). While the UI can utilize a Shadcn datepicker for week.year selection, the stored data format should be consistent. Storing the full date (`YYYY-MM-DD`) offers greater flexibility for future calculations (e.g., queen age) and can still be displayed as "week.year" as needed. The provided Zod schema will be used for now.