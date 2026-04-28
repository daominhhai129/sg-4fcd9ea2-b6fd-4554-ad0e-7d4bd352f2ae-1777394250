import { useState } from "react";
import Image from "next/image";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { shops } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FileText, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post } from "@/types";

const shop = shops[0];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>(shop.posts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      slug: (form.get("title") as string).toLowerCase().replace(/\s+/g, "-"),
      excerpt: form.get("excerpt") as string,
      content: form.get("content") as string,
      coverImage: form.get("coverImage") as string || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop",
      status: form.get("status") as Post["status"],
    };

    if (editing) {
      setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
    } else {
      const newPost: Post = {
        id: "post-new-" + Date.now(),
        shopId: shop.id,
        createdAt: new Date().toISOString().split("T")[0],
        ...data,
      };
      setPosts((prev) => [newPost, ...prev]);
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const openEdit = (post: Post) => { setEditing(post); setDialogOpen(true); };
  const openCreate = () => { setEditing(null); setDialogOpen(true); };

  return (
    <>
      <SEO title="Bài viết — Admin" />
      <AdminLayout title="Bài viết">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">{posts.length} bài viết</p>
          <Button className="gradient-primary text-white border-0" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Viết bài mới
          </Button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50">
              <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={post.coverImage} alt={post.title} width={192} height={128} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                    {post.status === "published" ? "Đã xuất bản" : "Nháp"}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {post.createdAt}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">{post.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => openEdit(post)}>
                    <Pencil className="w-3 h-3 mr-1" />
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Chưa có bài viết nào.</p>
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? "Chỉnh sửa bài viết" : "Viết bài mới"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>Tiêu đề</Label>
                <Input name="title" defaultValue={editing?.title || ""} required className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Tóm tắt</Label>
                <Textarea name="excerpt" defaultValue={editing?.excerpt || ""} className="rounded-xl mt-1" rows={2} />
              </div>
              <div>
                <Label>Nội dung</Label>
                <Textarea name="content" defaultValue={editing?.content || ""} className="rounded-xl mt-1" rows={5} />
              </div>
              <div>
                <Label>URL ảnh bìa</Label>
                <Input name="coverImage" defaultValue={editing?.coverImage || ""} className="rounded-xl mt-1" placeholder="https://..." />
              </div>
              <div>
                <Label>Trạng thái</Label>
                <Select name="status" defaultValue={editing?.status || "draft"}>
                  <SelectTrigger className="rounded-xl mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Xuất bản</SelectItem>
                    <SelectItem value="draft">Nháp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setDialogOpen(false)}>Hủy</Button>
                <Button type="submit" className="flex-1 gradient-primary text-white border-0 rounded-xl">Lưu</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}