import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export const categoryService = {
  async list(shopId: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("position", { ascending: true });

    console.log("categoryService.list", { data, error });
    if (error) throw error;
    return (data as Category[]) || [];
  },

  async create(input: CategoryInsert) {
    const { data, error } = await supabase
      .from("categories")
      .insert(input)
      .select()
      .single();

    console.log("categoryService.create", { data, error });
    if (error) throw error;
    return data;
  },

  async update(id: string, input: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    console.log("categoryService.update", { data, error });
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    console.log("categoryService.delete", { error });
    if (error) throw error;
  },

  async reorder(shopId: string, categoryIds: string[]) {
    const updates = categoryIds.map((id, index) => ({
      id,
      position: index,
      shop_id: shopId,
    }));

    const { error } = await supabase.from("categories").upsert(updates);

    console.log("categoryService.reorder", { error });
    if (error) throw error;
  },

  async getProductCount(categoryId: string) {
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId);

    console.log("categoryService.getProductCount", { count, error });
    if (error) throw error;
    return count || 0;
  },
};