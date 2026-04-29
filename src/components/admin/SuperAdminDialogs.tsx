import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Save, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateUserInput } from "@/contexts/AuthContext";

interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: number;
  shopName: string;
  onSave: (value: number) => void;
}

export function LimitDialog({ open, onOpenChange, initialValue, shopName, onSave }: LimitDialogProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => { if (open) setValue(initialValue); }, [open, initialValue]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">Giới hạn cho {shopName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Số lượng tối đa (áp dụng cho sản phẩm, danh mục, bài viết)</Label>
            <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="rounded-xl mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5">Ví dụ: nhập 100 → cả 3 mục đều giới hạn 100.</p>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={() => { onSave(value); onOpenChange(false); }}>
              <Save className="w-4 h-4 mr-1.5" /> Lưu
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
  const [mode, setMode] = useState<"days" | "date">("days");
  const [days, setDays] = useState(30);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setMode("days");
      setDays(30);
      const base = currentExpiry ? new Date(currentExpiry) : new Date();
      const initial = new Date(base);
      initial.setDate(initial.getDate() + 30);
      setDate(initial);
    }
  }, [open, currentExpiry]);

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
        <DialogHeader><DialogTitle className="font-heading">Gia hạn cho {userName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {currentExpiry && (
            <p className="text-xs text-muted-foreground">
              Hạn hiện tại: <span className="font-semibold text-foreground">{new Date(currentExpiry).toLocaleDateString("vi-VN")}</span>
            </p>
          )}

          <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-xl">
            <button type="button" onClick={() => setMode("days")} className={cn("py-1.5 text-xs font-semibold rounded-lg transition-colors", mode === "days" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              Số ngày
            </button>
            <button type="button" onClick={() => setMode("date")} className={cn("py-1.5 text-xs font-semibold rounded-lg transition-colors", mode === "date" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              Chọn ngày
            </button>
          </div>

          {mode === "days" ? (
            <div>
              <Label className="text-sm font-semibold">Số ngày gia hạn</Label>
              <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-xl mt-1.5" />
              <div className="flex gap-2 mt-2">
                {[30, 90, 180, 365].map((d) => (
                  <button key={d} type="button" onClick={() => setDays(d)} className="px-3 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary/10 transition-colors">{d} ngày</button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-semibold">Hạn mới</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start rounded-xl mt-1.5 font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {date ? date.toLocaleDateString("vi-VN") : "Chọn ngày..."}
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
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={handleConfirm}>Gia hạn</Button>
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", shopName: "", expiryDays: 90 });
  useEffect(() => { if (open) setForm({ name: "", email: "", phone: "", shopName: "", expiryDays: 90 }); }, [open]);
  const submit = () => {
    if (!form.name || !form.email || !form.shopName) return;
    const expiresAt = new Date(Date.now() + form.expiryDays * 86400000).toISOString();
    onCreate({ name: form.name, email: form.email, phone: form.phone, shopName: form.shopName, password: "iLoveProID@", expiresAt });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Tạo người dùng mới</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">Họ và tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Tên cửa hàng</Label><Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Hạn sử dụng (ngày)</Label><Input type="number" value={form.expiryDays} onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })} className="rounded-xl mt-1.5" /></div>
          <p className="text-xs text-muted-foreground">Mật khẩu mặc định: <code className="font-mono text-foreground">iLoveProID@</code></p>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>Tạo</Button>
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
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (open) { setPwd(""); setConfirm(""); setErr(""); } }, [open]);
  const submit = () => {
    if (pwd.length < 6) { setErr("Mật khẩu tối thiểu 6 ký tự"); return; }
    if (pwd !== confirm) { setErr("Mật khẩu xác nhận không khớp"); return; }
    onSave(pwd);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">Đổi mật khẩu Super Admin</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">Mật khẩu mới</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Xác nhận mật khẩu</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="rounded-xl mt-1.5" /></div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>Lưu</Button>
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
  const [domain, setDomain] = useState("");
  useEffect(() => { if (open) setDomain(currentDomain || ""); }, [open, currentDomain]);
  const submit = () => {
    onSave(domain);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">Liên kết tên miền cho {userName}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">Tên miền riêng</Label>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="vd: shop.example.com" className="rounded-xl mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1.5">Nhập domain không kèm http(s)://. Để trống để hủy liên kết.</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Hướng dẫn DNS:</p>
            <p>• Trỏ bản ghi <code className="text-foreground">CNAME</code> tới <code className="text-foreground">cname.platform.vn</code></p>
            <p>• Hoặc bản ghi <code className="text-foreground">A</code> tới <code className="text-foreground">76.76.21.21</code></p>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>Lưu</Button>
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", shopName: "" });
  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name, email: user.email, phone: user.phone || "", shopName: user.shopName || "" });
    }
  }, [open, user]);
  const submit = () => {
    if (!form.name || !form.email || !form.shopName) return;
    onSave(form);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Sửa thông tin chủ shop</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-sm font-semibold">Họ và tên</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Số điện thoại</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div><Label className="text-sm font-semibold">Tên cửa hàng</Label><Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} className="rounded-xl mt-1.5" /></div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={submit}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}