export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];

export function severityTone(wire) {
  if (typeof wire !== 'string') return 'unknown';
  const t = wire.trim().toLowerCase();
  return SEVERITIES.includes(t) ? t : 'unknown';
}

export function renderSeverityBadge(wire, { size = 'md', dot = true } = {}) {
  const tone = severityTone(wire);
  const el = document.createElement('span');
  el.className = 'pill';
  el.dataset.tone = tone;
  el.dataset.size = size;
  el.setAttribute('role', 'status');
  if (dot) {
    const d = document.createElement('span');
    d.className = 'pill__dot';
    d.setAttribute('aria-hidden', 'true');
    el.append(d);
  }
  el.append(document.createTextNode(tone === 'unknown' ? 'Unknown' : String(wire)));
  return el;
}
