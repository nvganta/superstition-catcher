// Generate a unique visitor ID stored in localStorage
export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem('sb-visitor-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('sb-visitor-id', id);
  }
  return id;
}
