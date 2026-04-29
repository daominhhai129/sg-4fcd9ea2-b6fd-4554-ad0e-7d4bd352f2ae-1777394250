import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save } from "lucide-react";
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
  onConfirm: (days: number) => void;
}

export function ExtendDialog({ open, onOpenChange, userName, onConfirm }: ExtendDialogProps) {
  const [days, setDays] = useState(30);
  useEffect(() => { if (open) setDays(30); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="font-heading">Gia hạn cho {userName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Số ngày gia hạn</Label>
            <Input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-xl mt-1.5" />
            <div className="flex gap-2 mt-2">
              {[30, 90, 180, 365].map((d) => (
                <button key={d} type="button" onClick={() => setDays(d)} className="px-3 py-1 rounded-lg text-xs font-medium bg-muted hover:bg-primary/10 transition-colors">{d} ngày</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button className="flex-1 gradient-primary text-white border-0 rounded-xl" onClick={() => { onConfirm(days); onOpenChange(false); }}>Gia hạn</Button>
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