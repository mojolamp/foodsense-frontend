export function getBooleanFeatureFlag(name: string, defaultValue = false): boolean {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue

  switch (raw.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'y':
    case 'on':
      return true
    case '0':
    case 'false':
    case 'no':
    case 'n':
    case 'off':
      return false
    default:
      return defaultValue
  }
}


