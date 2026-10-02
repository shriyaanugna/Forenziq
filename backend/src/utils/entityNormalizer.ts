export interface NormalizedEntity {
  type: string;
  original: string;
  normalized: string;
}

export function normalizeEntity(type: string, value: string): NormalizedEntity {
  const original = value.trim();
  let normalized = original;

  switch (type.toLowerCase()) {
    case 'email':
    case 'emails':
      normalized = original.toLowerCase();
      break;

    case 'url':
    case 'urls':
      try {
        let urlStr = original.toLowerCase();
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          urlStr = `https://${urlStr}`;
        }
        const parsed = new URL(urlStr);
        normalized = parsed.hostname.replace(/^www\./, '') + parsed.pathname.replace(/\/$/, '');
      } catch {
        normalized = original.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
      }
      break;

    case 'ip_address':
    case 'ip_addresses':
    case 'ip':
      normalized = original.trim();
      break;

    case 'phone_number':
    case 'phone_numbers':
    case 'phone':
      normalized = original.replace(/[^\d+]/g, '');
      break;

    case 'username':
    case 'usernames':
      normalized = original.toLowerCase().replace(/^@/, '');
      break;

    case 'transaction_id':
    case 'transaction_ids':
    case 'txn_id':
    case 'account_number':
    case 'account_numbers':
    case 'crypto_address':
    case 'crypto_addresses':
      normalized = original.toUpperCase().replace(/[\s-]/g, '');
      break;

    default:
      normalized = original.toLowerCase();
      break;
  }

  return {
    type,
    original,
    normalized,
  };
}
