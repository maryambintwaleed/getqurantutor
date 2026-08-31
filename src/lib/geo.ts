/**
 * Countries and time zones for teacher profiles.
 *
 * Both used to be free text, which produced "pak", "Pakistan ", "PK" and
 * "GMT+5" for the same teacher — impossible to group, sort or compare. They are
 * now picked from these lists, so a family comparing two teachers is comparing
 * the same thing.
 */

/** The countries most teachers and families are in, shown first in the list. */
export const COMMON_COUNTRIES = [
  "Pakistan", "Egypt", "India", "Bangladesh", "United Kingdom", "United States", "Canada",
  "Australia", "Saudi Arabia", "United Arab Emirates", "Türkiye", "Jordan", "Morocco",
  "Nigeria", "Malaysia", "Indonesia", "South Africa", "Germany", "France", "Netherlands",
];

/** Every country, alphabetically. */
export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia & Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo - Brazzaville", "Congo - Kinshasa", "Costa Rica",
  "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong SAR China", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao SAR China",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Samoa", "San Marino", "São Tomé & Príncipe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
  "St. Kitts & Nevis", "St. Lucia", "St. Vincent & Grenadines", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
  "Tonga", "Trinidad & Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

/**
 * IANA zone ids with a familiar label. Storing the id rather than "GMT+5" means
 * the offset shown to families stays correct through daylight saving changes.
 */
export const TIME_ZONES: { id: string; label: string }[] = [
  { id: "Asia/Karachi", label: "Pakistan" },
  { id: "Africa/Cairo", label: "Egypt" },
  { id: "Asia/Dhaka", label: "Bangladesh" },
  { id: "Asia/Kolkata", label: "India" },
  { id: "Asia/Colombo", label: "Sri Lanka" },
  { id: "Asia/Kathmandu", label: "Nepal" },
  { id: "Asia/Riyadh", label: "Saudi Arabia" },
  { id: "Asia/Dubai", label: "UAE" },
  { id: "Asia/Qatar", label: "Qatar" },
  { id: "Asia/Kuwait", label: "Kuwait" },
  { id: "Asia/Bahrain", label: "Bahrain" },
  { id: "Asia/Muscat", label: "Oman" },
  { id: "Asia/Amman", label: "Jordan" },
  { id: "Asia/Beirut", label: "Lebanon" },
  { id: "Asia/Damascus", label: "Syria" },
  { id: "Asia/Baghdad", label: "Iraq" },
  { id: "Asia/Jerusalem", label: "Palestine / Israel" },
  { id: "Asia/Tehran", label: "Iran" },
  { id: "Europe/Istanbul", label: "Türkiye" },
  { id: "Asia/Kabul", label: "Afghanistan" },
  { id: "Asia/Tashkent", label: "Uzbekistan" },
  { id: "Asia/Almaty", label: "Kazakhstan" },
  { id: "Asia/Jakarta", label: "Indonesia" },
  { id: "Asia/Kuala_Lumpur", label: "Malaysia" },
  { id: "Asia/Singapore", label: "Singapore" },
  { id: "Asia/Manila", label: "Philippines" },
  { id: "Asia/Tokyo", label: "Japan" },
  { id: "Asia/Shanghai", label: "China" },
  { id: "Africa/Casablanca", label: "Morocco" },
  { id: "Africa/Algiers", label: "Algeria" },
  { id: "Africa/Tunis", label: "Tunisia" },
  { id: "Africa/Tripoli", label: "Libya" },
  { id: "Africa/Khartoum", label: "Sudan" },
  { id: "Africa/Lagos", label: "Nigeria" },
  { id: "Africa/Accra", label: "Ghana" },
  { id: "Africa/Nairobi", label: "Kenya" },
  { id: "Africa/Johannesburg", label: "South Africa" },
  { id: "Europe/London", label: "United Kingdom" },
  { id: "Europe/Dublin", label: "Ireland" },
  { id: "Europe/Paris", label: "France" },
  { id: "Europe/Berlin", label: "Germany" },
  { id: "Europe/Amsterdam", label: "Netherlands" },
  { id: "Europe/Brussels", label: "Belgium" },
  { id: "Europe/Madrid", label: "Spain" },
  { id: "Europe/Rome", label: "Italy" },
  { id: "Europe/Stockholm", label: "Sweden" },
  { id: "Europe/Oslo", label: "Norway" },
  { id: "Europe/Copenhagen", label: "Denmark" },
  { id: "Europe/Moscow", label: "Russia" },
  { id: "America/New_York", label: "US Eastern" },
  { id: "America/Chicago", label: "US Central" },
  { id: "America/Denver", label: "US Mountain" },
  { id: "America/Los_Angeles", label: "US Pacific" },
  { id: "America/Toronto", label: "Toronto" },
  { id: "America/Vancouver", label: "Vancouver" },
  { id: "Australia/Sydney", label: "Sydney" },
  { id: "Australia/Perth", label: "Perth" },
  { id: "Pacific/Auckland", label: "New Zealand" },
];

/** Pre-selects the obvious zone once a country is chosen. */
export const COUNTRY_DEFAULT_ZONE: Record<string, string> = {
  "Pakistan": "Asia/Karachi",
  "Egypt": "Africa/Cairo",
  "Bangladesh": "Asia/Dhaka",
  "India": "Asia/Kolkata",
  "Sri Lanka": "Asia/Colombo",
  "Nepal": "Asia/Kathmandu",
  "Saudi Arabia": "Asia/Riyadh",
  "United Arab Emirates": "Asia/Dubai",
  "Qatar": "Asia/Qatar",
  "Kuwait": "Asia/Kuwait",
  "Bahrain": "Asia/Bahrain",
  "Oman": "Asia/Muscat",
  "Jordan": "Asia/Amman",
  "Lebanon": "Asia/Beirut",
  "Syria": "Asia/Damascus",
  "Iraq": "Asia/Baghdad",
  "Iran": "Asia/Tehran",
  "Türkiye": "Europe/Istanbul",
  "Afghanistan": "Asia/Kabul",
  "Uzbekistan": "Asia/Tashkent",
  "Kazakhstan": "Asia/Almaty",
  "Indonesia": "Asia/Jakarta",
  "Malaysia": "Asia/Kuala_Lumpur",
  "Singapore": "Asia/Singapore",
  "Philippines": "Asia/Manila",
  "Japan": "Asia/Tokyo",
  "China": "Asia/Shanghai",
  "Morocco": "Africa/Casablanca",
  "Algeria": "Africa/Algiers",
  "Tunisia": "Africa/Tunis",
  "Libya": "Africa/Tripoli",
  "Sudan": "Africa/Khartoum",
  "Nigeria": "Africa/Lagos",
  "Ghana": "Africa/Accra",
  "Kenya": "Africa/Nairobi",
  "South Africa": "Africa/Johannesburg",
  "United Kingdom": "Europe/London",
  "Ireland": "Europe/Dublin",
  "France": "Europe/Paris",
  "Germany": "Europe/Berlin",
  "Netherlands": "Europe/Amsterdam",
  "Belgium": "Europe/Brussels",
  "Spain": "Europe/Madrid",
  "Italy": "Europe/Rome",
  "Sweden": "Europe/Stockholm",
  "Norway": "Europe/Oslo",
  "Denmark": "Europe/Copenhagen",
  "Russia": "Europe/Moscow",
  "United States": "America/New_York",
  "Canada": "America/Toronto",
  "Australia": "Australia/Sydney",
  "New Zealand": "Pacific/Auckland",
};

const KNOWN_ZONE_IDS = new Set(TIME_ZONES.map((z) => z.id));

export const isKnownCountry = (value: string) => COUNTRIES.includes(value);
export const isKnownZone = (value: string) => KNOWN_ZONE_IDS.has(value);

/**
 * "Asia/Karachi" -> "GMT+5". Anything unrecognised is returned unchanged, so
 * the free text saved by teachers before this existed still displays sensibly.
 */
export function formatZone(zone: string): string {
  if (!zone) return "";
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const name = parts.find((p) => p.type === 'timeZoneName')?.value;
    return name ? name.replace('UTC', 'GMT') : zone;
  } catch {
    return zone;
  }
}

/** "Pakistan — GMT+5" for a profile summary line. */
export function zoneWithLabel(zone: string): string {
  const known = TIME_ZONES.find((z) => z.id === zone);
  const offset = formatZone(zone);
  if (!known) return offset;
  return offset ? known.label + " (" + offset + ")" : known.label;
}
