// Format tel do wyświetlania
// +48 123 456 789 format
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\s+/g, '');
  
  if (cleaned.startsWith('+48')) {
    const digits = cleaned.slice(3);
    const groups: string[] = [];
    for (let i = 0; i < digits.length; i += 3) {
      groups.push(digits.slice(i, i + 3));
    }
    return '+48 ' + groups.join(' ');
  }
  
  const hasPlus = cleaned.startsWith('+');
  const digits = hasPlus ? cleaned.slice(1) : cleaned;
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) {
    groups.push(digits.slice(i, i + 3));
  }
  const formatted = groups.join(' ');
  return hasPlus ? '+' + formatted : formatted;
}
