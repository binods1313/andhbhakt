import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PAGE_ACCENTS,
  applyPageAccent,
  getPageAccent,
  setPageAccent,
} from '@/lib/page-accent';

export function PageAccentSync() {
  const [location] = useLocation();
  useEffect(() => {
    applyPageAccent(getPageAccent(location));
  }, [location]);
  return null;
}

export function PageColorPicker() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(() => getPageAccent(location));
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHex(getPageAccent(location));
  }, [location]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function pick(next: string) {
    setHex(next);
    setPageAccent(location, next);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('pageColorLabel')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="relative">
          <Palette className="h-4 w-4" aria-hidden="true" />
          <span
            className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full border border-background"
            style={{ background: hex }}
            aria-hidden="true"
          />
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={t('pageColorLabel')}
          className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-card p-3 shadow-lg"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('pageColorLabel')}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {PAGE_ACCENTS.map((swatch) => {
              const selected = hex.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.id}
                  type="button"
                  className="h-11 w-full rounded-md border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    background: swatch.hex,
                    borderColor: selected ? 'var(--ch-text-primary, #111)' : 'transparent',
                  }}
                  aria-label={swatch.label}
                  aria-pressed={selected}
                  onClick={() => pick(swatch.hex)}
                />
              );
            })}
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-xs text-muted-foreground">
            <span>{t('pageColorCustom')}</span>
            <input
              type="color"
              value={hex.length === 7 ? hex : '#c2410c'}
              onChange={(e) => pick(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
              aria-label={t('pageColorCustom')}
            />
          </label>
        </div>
      )}
    </div>
  );
}
