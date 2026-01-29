/**
 * Format phone number for display
 * Adds spaces every 3 digits for readability
 * Special handling for +48: keeps it together, then spaces every 3 digits
 * 
 * @param phone - Phone number string (e.g., "+48123456789")
 * @returns Formatted phone (e.g., "+48 123 456 789")
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  
  // Remove all existing spaces
  const cleaned = phone.replace(/\s+/g, '');
  
  // Special handling for +48 (Poland)
  if (cleaned.startsWith('+48')) {
    const digits = cleaned.slice(3); // Get digits after +48
    
    // Split into groups of 3
    const groups: string[] = [];
    for (let i = 0; i < digits.length; i += 3) {
      groups.push(digits.slice(i, i + 3));
    }
    
    // Format: "+48 XXX XXX XXX"
    return '+48 ' + groups.join(' ');
  }
  
  // For other formats, keep + with first 2 digits, then space every 3
  const hasPlus = cleaned.startsWith('+');
  const digits = hasPlus ? cleaned.slice(1) : cleaned;
  
  // Split into groups of 3
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3));
  }
  
  // Join with spaces and add + back if it was there
  const formatted = groups.join(' ');
  return hasPlus ? '+' + formatted : formatted;
}

/**
 * Examples:
 * formatPhoneDisplay('+48123456789') => '+48 123 456 789'
 * formatPhoneDisplay('48123456789') => '48 123 456 789'
 * formatPhoneDisplay('+48 123 456 789') => '+48 123 456 789' (already formatted)
 */
