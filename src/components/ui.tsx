import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { href } from '../lib/router';

/* ------------------------------------------------------------------ */
/* お知らせ（スクリーンリーダーへの読み上げ + 画面下の小さな表示）          */
/* ------------------------------------------------------------------ */

const AnnounceContext = createContext<(message: string) => void>(() => {});

export function AnnounceProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const announce = useCallback((m: string) => {
    window.clearTimeout(timer.current);
    setMessage('');
    // 同じ文言でも読み上げられるよう、一度空にしてから入れる
    window.setTimeout(() => {
      setMessage(m);
      setVisible(true);
    }, 30);
    timer.current = window.setTimeout(() => setVisible(false), 3600);
  }, []);
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div className={`toast${visible ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        {message}
      </div>
    </AnnounceContext.Provider>
  );
}

export function useAnnounce() {
  return useContext(AnnounceContext);
}

/* ------------------------------------------------------------------ */
/* ページ見出し                                                         */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  lead,
  back,
  backLabel = '戻る',
}: {
  title: string;
  lead?: ReactNode;
  back?: string;
  backLabel?: string;
}) {
  useEffect(() => {
    document.title = title === '余白。' ? '余白。' : `${title}｜余白。`;
  }, [title]);
  return (
    <header className="page-header">
      {back && (
        <a className="back-link" href={href(back)}>
          <Icon name="back" size={20} />
          <span>{backLabel}</span>
        </a>
      )}
      <h1 id="page-title" tabIndex={-1}>
        {title}
      </h1>
      {lead && <div className="lead">{lead}</div>}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* 一覧のリンク行                                                        */
/* ------------------------------------------------------------------ */

export function LinkRow({
  to,
  icon,
  label,
  hint,
  large,
}: {
  to: string;
  icon?: IconName;
  label: string;
  hint?: string;
  large?: boolean;
}) {
  return (
    <li>
      <a className={`link-row${large ? ' is-large' : ''}`} href={href(to)}>
        {icon && (
          <span className="link-row__icon">
            <Icon name={icon} />
          </span>
        )}
        <span className="link-row__text">
          <span className="link-row__label">{label}</span>
          {hint && <span className="link-row__hint">{hint}</span>}
        </span>
        <Icon name="chevron" size={20} className="link-row__chevron" />
      </a>
    </li>
  );
}

export function LinkList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul className="link-list" aria-label={label}>
      {children}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* ボタン                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'quiet';

export function Button({
  children,
  onClick,
  variant = 'secondary',
  icon,
  type = 'button',
  disabled,
  pressed,
  className,
  describedBy,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  type?: 'button' | 'submit';
  disabled?: boolean;
  pressed?: boolean;
  className?: string;
  describedBy?: string;
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-describedby={describedBy}
    >
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
    </button>
  );
}

export function ButtonLink({ to, children, icon, variant = 'secondary' }: { to: string; children: ReactNode; icon?: IconName; variant?: ButtonVariant }) {
  return (
    <a className={`btn btn--${variant}`} href={href(to)}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* 外部リンク（新しいタブ・参照元を送らない）                               */
/* ------------------------------------------------------------------ */

export function ExternalLink({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  const isWeb = /^https:\/\//.test(url);
  if (!isWeb && !/^tel:\d+$/.test(url)) return <span>{children}</span>;
  if (!isWeb) {
    return (
      <a className={className ?? 'tel-link'} href={url}>
        <Icon name="phone" size={20} />
        <span>{children}</span>
        <span className="visually-hidden">（電話をかける）</span>
      </a>
    );
  }
  return (
    <a className={className ?? 'external-link'} href={url} target="_blank" rel="noopener noreferrer">
      <span>{children}</span>
      <Icon name="external" size={18} />
      <span className="visually-hidden">（外部サイト。新しいタブで開きます）</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* 選択肢（ラジオボタンのグループ）                                        */
/* ------------------------------------------------------------------ */

export function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
  columns,
  hint,
  chips,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
  hint?: string;
  /** 短い選択肢を横に並べる */
  chips?: boolean;
}) {
  const name = useId();
  const hintId = `${name}-hint`;
  return (
    <fieldset className="choice" aria-describedby={hint ? hintId : undefined}>
      <legend>{legend}</legend>
      {hint && (
        <p className="choice__hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className={`choice__options${chips ? ' chips' : columns ? ` cols-${columns}` : ''}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice__option${chips ? ' choice__option--chip' : ''}${value === o.value ? ' is-checked' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="choice__mark" aria-hidden="true">
              <Icon name="check" size={18} />
            </span>
            <span className="choice__label">
              {o.label}
              {o.hint && <span className="choice__option-hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** 複数選択（チェックボックス）。色だけでなく✓印と枠線で選択状態を示す */
export function MultiChoice({
  legend,
  values,
  options,
  onToggle,
  hint,
}: {
  legend: string;
  values: string[];
  options: { value: string; label: string }[];
  onToggle: (v: string) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <fieldset className="choice" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend>{legend}</legend>
      {hint && (
        <p className="choice__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <div className="choice__options chips">
        {options.map((o) => {
          const checked = values.includes(o.value);
          return (
            <label key={o.value} className={`chip${checked ? ' is-checked' : ''}`}>
              <input type="checkbox" checked={checked} onChange={() => onToggle(o.value)} />
              <span className="chip__mark" aria-hidden="true">
                <Icon name="check" size={16} />
              </span>
              <span>{o.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="switch-row">
      <label className="switch" htmlFor={id}>
        <span className="switch__text">
          <span className="switch__label">{label}</span>
          {hint && <span className="switch__hint">{hint}</span>}
        </span>
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="switch__track" aria-hidden="true">
          <span className="switch__thumb" />
        </span>
        <span className="switch__state" aria-hidden="true">
          {checked ? 'オン' : 'オフ'}
        </span>
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 確認ダイアログ（ネイティブの <dialog> を使用）                           */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = 'やめる',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id={titleId} className="dialog__title">
        {title}
      </h2>
      <div className="dialog__body">{children}</div>
      <div className="dialog__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel} autoFocus>
          <span>{cancelLabel}</span>
        </button>
        <button type="button" className="btn btn--primary" onClick={onConfirm}>
          <span>{confirmLabel}</span>
        </button>
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* その他                                                              */
/* ------------------------------------------------------------------ */

export function Notice({ children, tone = 'info', title }: { children: ReactNode; tone?: 'info' | 'care'; title?: string }) {
  return (
    <aside className={`notice notice--${tone}`}>
      <Icon name="info" size={20} />
      <div>
        {title && <p className="notice__title">{title}</p>}
        {children}
      </div>
    </aside>
  );
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function Section({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  const hid = useId();
  return (
    <section className="section" aria-labelledby={title ? hid : undefined} id={id}>
      {title && (
        <h2 className="section__title" id={hid}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** 同じ画面の中で段階が変わったとき、見出しへフォーカスを戻す（読み上げ・キーボード操作のため） */
export function useFocusTitleOnChange(dep: unknown) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.getElementById('page-title')?.focus({ preventScroll: true });
  }, [dep]);
}
