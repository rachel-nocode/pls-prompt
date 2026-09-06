# Download analytics

Studio → Download analytics shows public recipe download responses per project over the last 30 UTC calendar days, including today. Counts start at deployment; historical downloads cannot be reconstructed.

The download route records an atomic daily aggregate only after finding an accessible published recipe/version and building its file. HEAD preparation checks and errors do not count. The UI uses HEAD before its native GET download to avoid double counting. Authenticated creator requests and recognizable bot user agents are excluded. Analytics failures never block downloads.

Stored fields: UTC day, recipe ID, recipe version ID, count. No visitor identifiers, cookies, IP addresses, emails, or prompt contents are stored. Aggregates are retained for future comparisons. Studio reports require creator authentication.

These are responses served, not proof of a completed browser save, unique visitors, or purchases. Repeat downloads count again; unidentified bots can count. Copy actions, private library exports, and legacy attachments are outside this initial report. Future checkout conversions should come from verified payment events, independently of download counts.
