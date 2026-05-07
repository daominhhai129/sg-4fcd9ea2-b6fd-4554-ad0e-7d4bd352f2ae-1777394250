import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Save, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CreateUserInput, CreateSubAdminInput } from "@/contexts/AuthContext";

interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: number;
  shopName: string;
  onSave: (value: number) => void;
}

export function LimitDialog({ open, onOpenChange, initialValue, shopName, onSave }: LimitDialogProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (open) setValue(initialValue); }, [open, initialValue]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.limitTitle").replace("{shop}", shopName)}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">{t("saDlg.limitLabel")}</Label>
            <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="rounded-xl mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5">{t("saDlg.limitHint")}</p>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={() => { onSave(value); onOpenChange(false); }}>
              <Save className="w-4 h-4 mr-1.5" /> {t("common.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentExpiry?: string;
  onConfirm: (days: number) => void;
}

export function ExtendDialog({ open, onOpenChange, userName, currentExpiry, onConfirm }: ExtendDialogProps) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<"days" | "date">("days");
  const [days, setDays] = useState(30);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const locale = language === "en" ? "en-US" : "vi-VN";

  useEffect(() => {
    if (open) {
      setMode("days");
      setDays(30);
      const base = currentExpiry ? new Date(currentExpiry) : new Date();
      const initialDate = new Date(base);
      initialDate.setDate(initialDate.getDate() + 30);
      setDate(initialDate);
    }
  }, [open]);

  const handleConfirm = () => {
    if (mode === "days") {
      onConfirm(days);
    } else if (date) {
      const base = currentExpiry ? new Date(currentExpiry) : new Date();
      const diffMs = date.getTime() - base.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      onConfirm(diffDays);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.extendTitle").replace("{name}", userName)}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {currentExpiry && (
            <p className="text-xs text-muted-foreground">
              {t("saDlg.currentExpiry")} <span className="font-semibold text-foreground">{new Date(currentExpiry).toLocaleDateString(locale)}</span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
            <button type="button" onClick={() => setMode("days")} className={cn("py-1.5 text-xs font-semibold rounded-lg transition-colors", mode === "days" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              {t("saDlg.modeDays")}
            </button>
            <button type="button" onClick={() => setMode("date")} className={cn("py-1.5 text-xs font-semibold rounded-lg transition-colors", mode === "date" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              {t("saDlg.modeDate")}
            </button>
          </div>

          {mode === "days" ? (
            <div>
              <Label className="text-sm font-semibold">{t("saDlg.daysLabel")}</Label>
              <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-xl mt-1.5" />
              <div className="flex gap-2 mt-2">
                {[30, 90, 180, 365].map((d) => (
                  <button key={d} type="button" onClick={() => setDays(d)} className="px-3 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary/10 transition-colors">{d} {t("saDlg.daysSuffix")}</button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-semibold">{t("saDlg.dateLabel")}</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start rounded-xl mt-1.5 font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? date.toLocaleDateString(locale) : t("saDlg.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setPopoverOpen(false); }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={handleConfirm}>{t("saDlg.extendBtn")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateUserInput) => void;
}

export function CreateUserDialog({ open, onOpenChange, onCreate }: CreateUserDialogProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<CreateUserInput>({ name: "", email: "", phone: "", shopName: "", expiryDays: 90 });
  useEffect(() => { if (open) setForm({ name: "", email: "", phone: "", shopName: "", expiryDays: 90 }); }, [open]);
  const submit = () => {
    if (!form.name || !form.email || !form.shopName) return;
    onCreate(form);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.createUserTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">{t("saDlg.fullName")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.email")}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.shopName")}</Label><Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.expiryDays")}</Label><Input type="number" value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })} className="rounded-xl mt-1.5" /></div>
          <p className="text-xs text-muted-foreground">{t("saDlg.defaultPwd")} <code className="font-mono text-foreground">iLoveProID@</code></p>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>{t("saDlg.create")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newPassword: string) => void;
}

export function AdminPasswordDialog({ open, onOpenChange, onSave }: AdminPasswordDialogProps) {
  const { t } = useLanguage();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setPwd(""); setConfirm(""); setErr(""); } }, [open]);
  const submit = () => {
    if (pwd.length < 6) { setErr(t("saDlg.errPwdLen")); return; }
    if (pwd !== confirm) { setErr(t("saDlg.errPwdMatch")); return; }
    onSave(pwd);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.adminPwdTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">{t("saDlg.newPwd")}</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.confirmPwd")}</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="rounded-xl mt-1.5" /></div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  currentDomain?: string;
  onSave: (domain: string) => void;
}

export function DomainDialog({ open, onOpenChange, userName, currentDomain, onSave }: DomainDialogProps) {
  const { t } = useLanguage();
  const [domain, setDomain] = useState("");
  useEffect(() => { if (open) setDomain(currentDomain || ""); }, [open, currentDomain]);
  const submit = () => {
    onSave(domain);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.domainTitle").replace("{name}", userName)}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">{t("saDlg.domainLabel")}</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={t("saDlg.domainPh")} className="rounded-xl mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5">{t("saDlg.domainHint")}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">{t("saDlg.dnsHelp")}</p>
            <p>• {t("saDlg.dnsCname")} <code className="text-foreground">cname.platform.vn</code></p>
            <p>• {t("saDlg.dnsA")} <code className="text-foreground">76.76.21.21</code></p>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; name: string; email: string; phone?: string; shopName?: string } | null;
  onSave: (input: { name: string; email: string; phone: string; shopName: string }) => void;
}

export function EditUserDialog({ open, onOpenChange, user, onSave }: EditUserDialogProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", shopName: "" });
  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name, email: user.email, phone: user.phone || "", shopName: user.shopName || "" });
    }
  }, [open]);
  const submit = () => {
    if (!form.name || !form.email || !form.shopName) return;
    onSave(form);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">{t("saDlg.editUserTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">{t("saDlg.fullName")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.email")}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.shopName")}</Label><Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>{t("common.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SubAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { name: string; email: string; phone: string; maxSites: number } | null;
  title: string;
  isEdit?: boolean;
  onSubmit: (input: CreateSubAdminInput) => void;
}

export function SubAdminDialog({ open, onOpenChange, initial, title, isEdit, onSubmit }: SubAdminDialogProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<CreateSubAdminInput>({ name: "", email: "", phone: "", maxSites: 5000, password: "" });
  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial, password: "" } : { name: "", email: "", phone: "", maxSites: 5000, password: "" });
    }
  }, [open]);
  const submit = () => {
    if (!form.name || !form.email) return;
    const payload: CreateSubAdminInput = { name: form.name, email: form.email, phone: form.phone, maxSites: form.maxSites };
    if (form.password && form.password.trim().length > 0) payload.password = form.password.trim();
    onSubmit(payload);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">{title}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">{t("saDlg.fullName")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.email")}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">{t("saDlg.phone")}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div>
            <Label className="text-sm font-semibold">{isEdit ? t("saDlg.passwordNew") : t("saDlg.password")}</Label>
            <Input type="text" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl mt-1.5 font-mono" placeholder={isEdit ? t("saDlg.passwordPhKeep") : "iLoveProID@"} />
            <p className="text-xs text-muted-foreground mt-1.5">{isEdit ? t("saDlg.passwordHintEdit") : t("saDlg.passwordHintCreate")}</p>
          </div>
          <div>
            <Label className="text-sm font-semibold">{t("saDlg.maxSites")}</Label>
            <Input type="number" value={form.maxSites} onChange={(e) => setForm({ ...form, maxSites: Number(e.target.value) })} className="rounded-xl mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5">{t("saDlg.maxSitesHint")}</p>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>{isEdit ? t("common.save") : t("saDlg.create")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}