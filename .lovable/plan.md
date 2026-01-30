

## Vakantie Parken Nederland - Aangepast Plan

### Overzicht
Een moderne, minimalistische website waar bezoekers alle Nederlandse vakantieparken en campings kunnen ontdekken. Content wordt slim geïmporteerd via Google Places API - jij zoekt per regio en selecteert welke parken op de website komen.

---

### Pagina's & Functionaliteit

#### 🏠 Homepage
- Hero sectie met zoekbalk en aantrekkelijke afbeelding
- Uitgelichte/populaire vakantieparken
- Snelfilters voor type accommodatie (camping, bungalowpark, glamping, etc.)
- Recente reviews van bezoekers

#### 🔍 Zoeken & Ontdekken
- **Lijstweergave** met parkkaarten (foto, naam, locatie, rating, korte beschrijving)
- **Kaartweergave** met interactieve kaart van Nederland waar parken als markers worden getoond
- **Filters** voor:
  - Provincie/regio
  - Type park (camping, bungalow, glamping, etc.)
  - Faciliteiten (zwembad, huisdieren welkom, WiFi, restaurant, speeltuin, etc.)
  - Beoordeling (sterren)
- Sorteren op: populariteit, beoordeling, naam

#### 📍 Park Detailpagina
- Uitgebreide **fotogalerij** (foto's van Google Places + eigen uploads)
- Beschrijving en faciliteiten van het park
- **Locatie op kaart** met adresgegevens
- Link naar officiële website van het park
- Contactgegevens en openingstijden (uit Google Places)
- **Reviews sectie** met eigen reviews van bezoekers

#### 📝 Review Plaatsen
- Eenvoudig formulier: naam, sterrenbeoordeling (1-5), tekstuele review
- Geen account nodig - laagdrempelig voor bezoekers

---

### 🆕 Admin Panel - Google Places Import

#### Import Tool
1. **Zoeken per regio** - Voer een plaatsnaam, provincie of regio in (bijv. "Veluwe", "Noord-Holland", "Texel")
2. **Type selecteren** - Kies wat je zoekt: campings, vakantieparken, bungalowparken, etc.
3. **Resultaten bekijken** - Google Places toont een lijst met gevonden parken inclusief:
   - Naam
   - Adres
   - Google rating
   - Foto preview
   - Openingstijden
4. **Selecteren & Importeren** - Vink aan welke parken je wilt toevoegen aan je website
5. **Geïmporteerd** - Geselecteerde parken worden opgeslagen in je database

#### Park Beheer
- Overzicht van alle geïmporteerde parken
- Per park kun je:
  - Extra foto's uploaden
  - Beschrijving aanpassen of uitbreiden
  - Faciliteiten toevoegen/bewerken
  - Park verbergen of verwijderen
- Reviews modereren indien nodig

---

### Design & Stijl
- **Modern & minimalistisch** met veel witruimte
- Rustige, neutrale kleuren met zachte accenten
- Strakke typografie en duidelijke hiërarchie
- Grote, aantrekkelijke foto's
- Responsive design voor desktop, tablet en mobiel

---

### Technische Vereisten
- **Google Places API** voor het zoeken en importeren van parken
- **Database** voor opgeslagen parken, aanvullende info en reviews
- **Admin authenticatie** voor het beheer
- **Interactieve kaart** met park markers

