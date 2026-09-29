import type { ReactNode } from "react";
import { addListItem, deleteListItem, moveListItem, saveListItem } from "./actions";
import { ConfirmButton } from "./ConfirmButton";
import { getPath, LIST_FIELDS, type Field, type ListSection } from "./fields";

export type OptionCtx = Record<NonNullable<Field["optionsFrom"]>, { value: string; label: string }[]>;

const SPAN = { 1: "", 2: "sm:col-span-2", 4: "sm:col-span-4" } as const;

export function FieldGrid({ fields, value, ctx }: { fields: Field[]; value: unknown; ctx: OptionCtx }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {fields.map((f) => {
        const v = getPath(value, f.name);
        const span = SPAN[f.span ?? (f.type === "textarea" ? 4 : 1)];
        if (f.type === "checkbox") {
          return (
            <label key={f.name} className={`flex items-center gap-2 self-end pb-2 text-sm text-slate-200 ${span}`}>
              <input type="checkbox" name={f.name} defaultChecked={Boolean(v)} className="h-4 w-4 accent-lime-400" />
              {f.label}
            </label>
          );
        }
        const common = { name: f.name, required: f.required, className: "input mt-1" };
        let input: ReactNode;
        if (f.type === "textarea") {
          input = <textarea {...common} className="input mt-1 min-h-[80px]" defaultValue={v == null ? "" : String(v)} />;
        } else if (f.type === "select") {
          const options = f.options ?? (f.optionsFrom ? ctx[f.optionsFrom] : []);
          input = (
            <select {...common} defaultValue={v == null ? "" : String(v)}>
              {f.required ? null : <option value="">—</option>}
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        } else {
          input = (
            <input
              {...common}
              type={f.type === "url" ? "text" : f.type}
              min={f.min}
              max={f.max}
              step={f.step ?? (f.type === "number" ? "any" : undefined)}
              placeholder={f.placeholder}
              defaultValue={v == null ? "" : String(v)}
            />
          );
        }
        return (
          <label key={f.name} className={`text-xs text-slate-400 ${span}`}>
            {f.label}
            {input}
          </label>
        );
      })}
    </div>
  );
}

export function SaveButton({ children = "保存" }: { children?: ReactNode }) {
  return (
    <button type="submit" className="btn-primary">
      {children}
    </button>
  );
}

type ListEditorProps<T> = {
  section: ListSection;
  items: T[];
  ctx: OptionCtx;
  addLabel: string;
  summary: (item: T) => ReactNode;
  openWhen?: (item: T) => boolean;
};

export function ListEditor<T>({ section, items, ctx, addLabel, summary, openWhen }: ListEditorProps<T>) {
  return (
    <div className="space-y-2">
      <form action={addListItem}>
        <input type="hidden" name="section" value={section} />
        <button type="submit" className="btn-ghost">
          + {addLabel}
        </button>
      </form>
      {items.map((item, i) => {
        const id = (item as { id?: string }).id ?? "";
        return (
          <details
            key={`${id}-${i}`}
            open={openWhen?.(item)}
            className="rounded-lg border border-slate-700 bg-slate-900/40 open:border-cyan-400/40"
          >
            <summary className="cursor-pointer select-none px-3 py-2.5 text-sm text-slate-200">{summary(item)}</summary>
            <div className="border-t border-slate-800 p-3">
              <form action={saveListItem}>
                <input type="hidden" name="section" value={section} />
                <input type="hidden" name="index" value={i} />
                <input type="hidden" name="key" value={id} />
                <FieldGrid fields={LIST_FIELDS[section]} value={item} ctx={ctx} />
                <div className="mt-3">
                  <SaveButton />
                </div>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-3 text-xs">
                <form action={moveListItem} className="flex gap-3">
                  <input type="hidden" name="section" value={section} />
                  <input type="hidden" name="index" value={i} />
                  <input type="hidden" name="key" value={id} />
                  <button type="submit" name="dir" value="up" disabled={i === 0} className="text-slate-400 hover:text-white disabled:opacity-30">
                    ↑ 上移
                  </button>
                  <button
                    type="submit"
                    name="dir"
                    value="down"
                    disabled={i === items.length - 1}
                    className="text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    ↓ 下移
                  </button>
                </form>
                <form action={deleteListItem}>
                  <input type="hidden" name="section" value={section} />
                  <input type="hidden" name="index" value={i} />
                  <input type="hidden" name="key" value={id} />
                  <ConfirmButton message="确定删除这一条吗？" className="text-slate-500 hover:text-rose-300">
                    删除
                  </ConfirmButton>
                </form>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
