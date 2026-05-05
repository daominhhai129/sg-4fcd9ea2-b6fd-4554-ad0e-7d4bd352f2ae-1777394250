import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Package, MapPin, User as UserIcon, Lock, LogOut, ShoppingBag, Calendar,
  CheckCircle2, Clock, XCircle, Save, Eye, EyeOff, Check, AlertCircle,
  Plus, Trash2, Star, Pencil,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, MAX_ADDRESSES } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formatPrice = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
};

export default function MemberDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, logout, updateMemberInfo, updateMemberPassword, addMemberAddress, updateMemberAddress, deleteMemberAddress, setDefaultMemberAddress } = useAuth();
  const { toast } = useToast();

  const statusConfig = {
    pending: { label: t("member.statusPending"), icon: Clock, className: "bg-amber-100 text-amber-700 border-amber-200" },
    confirmed: { label: t("member.statusConfirmed"), icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    cancelled: { label: t("member.statusCancelled"), icon: XCircle, className: "bg-rose-100 text-rose-700 border-rose-200" },
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const [newRecipientPhone, setNewRecipientPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaved, setPwdSaved] = useState(false);

  const [continueHref, setContinueHref] = useState("/");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "member") {
      router.push("/admin");
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    const def = (user.addresses || []).find((a) => a.isDefault) || (user.addresses || [])[0];
    setDefaultAddress(def?.address || "");
  }, [user, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const slug = localStorage.getItem("lastShopSlug");
        if (slug) setContinueHref("/shop/" + slug);
      } catch {}
    }
  }, []);

  if (!user || user.role !== "member") return null;

  const orders = (user.orders || []).slice(0, 10);
  const addresses = user.addresses || [];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMemberInfo({ name, email, phone });
    const trimmedAddr = defaultAddress.trim();
    if (trimmedAddr) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) {
        if (def.address !== trimmedAddr) {
          updateMemberAddress(def.id, { recipientName: def.recipientName || name, recipientPhone: def.recipientPhone || phone, address: trimmedAddr });
        }
      } else {
        addMemberAddress({ recipientName: name, recipientPhone: phone, address: trimmedAddr });
      }
    }
    setProfileSaved(true);
    toast({ variant: "success", title: t("member.toastUpdated") });
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleAddAddress = () => {
    if (!newRecipient.trim() || !newRecipientPhone.trim() || !newAddress.trim()) {
      toast({ variant: "destructive", title: t("member.toastMissing"), description: t("member.toastMissingDesc") });
      return;
    }
    if (editingId) {
      updateMemberAddress(editingId, { recipientName: newRecipient.trim(), recipientPhone: newRecipientPhone.trim(), address: newAddress.trim() });
      setEditingId(null);
      setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
      setShowAddForm(false);
      toast({ variant: "success", title: t("member.toastAddrUpdated") });
      return;
    }
    if (addresses.length >= MAX_ADDRESSES) {
      toast({ variant: "destructive", title: t("member.toastLimit"), description: t("member.toastLimitDesc", { n: MAX_ADDRESSES }) });
      return;
    }
    const ok = addMemberAddress({ recipientName: newRecipient.trim(), recipientPhone: newRecipientPhone.trim(), address: newAddress.trim() });
    if (ok) {
      setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
      setShowAddForm(false);
      toast({ variant: "success", title: t("member.toastAddrAdded") });
    }
  };

  const handleStartEdit = (id: string) => {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setNewRecipient(a.recipientName || "");
    setNewRecipientPhone(a.recipientPhone || "");
    setNewAddress(a.address || "");
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setNewRecipient(""); setNewRecipientPhone(""); setNewAddress("");
  };

  const handlePwdSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError(t("member.errFill"));
      return;
    }
    if (currentPwd !== user.password) {
      setPwdError(t("member.errWrong"));
      return;
    }
    if (newPwd.length < 6) {
      setPwdError(t("member.errShort"));
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError(t("member.errMatch"));
      return;
    }
    updateMemberPassword(newPwd);
    setPwdSaved(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    toast({ variant: "success", title: t("member.pwdSaved") });
    setTimeout(() => setPwdSaved(false), 2500);
  };

  return (
    <>
      <SEO title="Member Dashboard" />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href={continueHref} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>{t("member.continueShopping")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="rounded-xl">
                <LogOut className="w-4 h-4 mr-1.5" />
                {t("member.logout")}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground">{t("member.greeting", { name: user.name.split(" ").pop() || user.name })}</h1>
            <p className="text-muted-foreground mt-1">{t("member.subtitle")}</p>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="bg-card border border-border/50 rounded-2xl p-1 h-auto">
              <TabsTrigger value="orders" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> {t("member.tabOrders")}
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UserIcon className="w-4 h-4 mr-1.5" /> {t("member.tabProfile")}
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="w-4 h-4 mr-1.5" /> {t("member.tabSecurity")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">{t("member.orderHistoryTitle")}</h2>
                <p className="text-xs text-muted-foreground mb-5">{t("member.orderHistoryDesc", { shown: orders.length, total: (user.orders || []).length })}</p>

                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p>{t("member.noOrders")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const cfg = statusConfig[o.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={o.id} className="border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-semibold text-foreground">#{o.id}</span>
                                <Badge variant="outline" className={"rounded-full text-xs " + cfg.className}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(o.date)}</span>
                                <Link href={"/shop/" + o.shopSlug} className="hover:text-primary hover:underline">{o.shopName}</Link>
                              </div>
                            </div>
                            <p className="font-heading font-bold text-primary whitespace-nowrap">{formatPrice(o.total)}</p>
                          </div>
                          <div className="space-y-0.5">
                            {o.items.map((it, idx) => (
                              <p key={idx} className="text-sm text-foreground/80">
                                <Link href={"/shop/" + o.shopSlug + "/product/" + it.productId} className="hover:text-primary hover:underline transition-colors">
                                  {it.name}
                                </Link>
                                <span className="text-muted-foreground"> × {it.quantity}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-6 space-y-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg mb-1">{t("member.profileTitle")}</h2>
                <p className="text-xs text-muted-foreground mb-5">{t("member.profileDesc")}</p>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("member.fullName")}</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl mt-1.5" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">{t("member.email")}</Label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl mt-1.5" required />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">{t("member.phone")}</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("member.shippingAddress")}</Label>
                    <Textarea
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      placeholder={t("member.shippingAddressPh")}
                      className="rounded-xl mt-1.5 min-h-[70px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t("member.shippingAddressHint")}</p>
                  </div>

                  {profileSaved && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                      <Check className="w-4 h-4" /> {t("member.saved")}
                    </div>
                  )}

                  <Button type="submit" className="rounded-xl">
                    <Save className="w-4 h-4 mr-1.5" /> {t("member.saveChanges")}
                  </Button>
                </form>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-heading font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    {t("member.otherAddresses")}
                  </h2>
                  <Badge variant="outline" className="rounded-full">{addresses.length}/{MAX_ADDRESSES}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-5">{t("member.otherAddressesDesc", { n: MAX_ADDRESSES })}</p>

                <div className="space-y-2">
                  {addresses.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">{t("member.noAddresses")}</p>
                  )}
                  {addresses.map((addr) => (
                    <div key={addr.id} className={"flex items-start gap-3 p-3 rounded-xl border transition-colors " + (addr.isDefault ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-primary/30")}>
                      <button
                        type="button"
                        onClick={() => setDefaultMemberAddress(addr.id)}
                        className={"mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors " + (addr.isDefault ? "border-primary bg-primary" : "border-muted-foreground/40 hover:border-primary")}
                        title={addr.isDefault ? t("member.default") : t("member.setDefault")}
                      >
                        {addr.isDefault && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        {(addr.recipientName || addr.recipientPhone) && (
                          <p className="text-sm font-semibold text-foreground">
                            {addr.recipientName}
                            {addr.recipientName && addr.recipientPhone && <span className="text-muted-foreground font-normal"> · </span>}
                            {addr.recipientPhone && <span className="text-muted-foreground font-normal">{addr.recipientPhone}</span>}
                          </p>
                        )}
                        <p className="text-sm text-foreground/80 mt-0.5">{addr.address}</p>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1">
                            <Star className="w-3 h-3 fill-current" /> {t("member.default")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => handleStartEdit(addr.id)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => deleteMemberAddress(addr.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {showAddForm ? (
                  <div className="mt-4 p-4 rounded-xl border border-dashed border-primary/40 space-y-3">
                    <p className="text-sm font-semibold text-foreground">{editingId ? t("member.editAddrTitle") : t("member.addAddrTitle")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold">{t("member.recipientName")}</Label>
                        <Input value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} className="rounded-xl mt-1" autoFocus />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold">{t("member.recipientPhone")}</Label>
                        <Input value={newRecipientPhone} onChange={(e) => setNewRecipientPhone(e.target.value)} className="rounded-xl mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">{t("member.addressLabel")}</Label>
                      <Textarea value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder={t("member.shippingAddressPh")} className="rounded-xl min-h-[70px] mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddAddress} size="sm" className="rounded-xl">
                        <Save className="w-4 h-4 mr-1.5" /> {editingId ? t("member.saveEdit") : t("member.saveAddress")}
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleCancelForm} className="rounded-xl">
                        {t("member.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(true)} disabled={addresses.length >= MAX_ADDRESSES} className="rounded-xl mt-4 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1.5" /> {t("member.addAddress")}
                    {addresses.length >= MAX_ADDRESSES && <span className="ml-2 text-xs text-muted-foreground">{t("member.limitReached")}</span>}
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-xl">
                <h2 className="font-heading font-bold text-lg mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> {t("member.changePwd")}
                </h2>
                <p className="text-xs text-muted-foreground mb-5">{t("member.pwdHint")}</p>

                <form onSubmit={handlePwdSave} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("member.currentPwd")}</Label>
                    <div className="relative mt-1.5">
                      <Input type={showPwd ? "text" : "password"} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className="rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("member.newPwd")}</Label>
                    <Input type={showPwd ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className="rounded-xl mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("member.confirmPwd")}</Label>
                    <Input type={showPwd ? "text" : "password"} value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className="rounded-xl mt-1.5" />
                  </div>

                  {pwdError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                      <AlertCircle className="w-4 h-4" /> {pwdError}
                    </div>
                  )}
                  {pwdSaved && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                      <Check className="w-4 h-4" /> {t("member.pwdSaved")}
                    </div>
                  )}

                  <Button type="submit" className="rounded-xl">
                    <Save className="w-4 h-4 mr-1.5" /> {t("member.changePwd")}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}