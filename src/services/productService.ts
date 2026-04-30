import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export interface ProductWithCategory extends Product {
  category?: {
    id: string;
    name: string;
  } | null;
}

export const productService = {
  async list(shopId: string, page = 1, perPage = 10) {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*, category:categories(id, name)", { count: "exact" })
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .range(from, to);

    console.log("productService.list", { data, error, count });
    if (error) throw error;

    return {
      products: (data as ProductWithCategory[]) || [],
      total: count || 0,
    };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name)")
      .eq("id", id)
      .single();

    console.log("productService.getById", { data, error });
    if (error) throw error;
    return data as ProductWithCategory;
  },

  async getByShopSlug(shopSlug: string) {
    const { data: shop } = await supabase
      .from("shops")
      .select("id")
      .eq("slug", shopSlug)
      .single();

    if (!shop) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name)")
      .eq("shop_id", shop.id)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    console.log("productService.getByShopSlug", { data, error });
    if (error) throw error;
    return (data as ProductWithCategory[]) || [];
  },

  async create(input: ProductInsert) {
    const { data, error } = await supabase
      .from("products")
      .insert(input)
      .select()
      .single();

    console.log("productService.create", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, input: ProductUpdate) {
    const { data, error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    console.log("productService.update", { data, error });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    console.log("productService.delete", { error });
    if (error) throw error;
  },

  async search(shopId: string, query: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name)")
      .eq("shop_id", shopId)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    console.log("productService.search", { data, error });
    if (error) throw error;
    return (data as ProductWithCategory[]) || [];
  },
};