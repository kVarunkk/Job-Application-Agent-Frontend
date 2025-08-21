"use client";

import { createClient } from "@/lib/supabase/client";
import { ICompanyInfo, IFormData } from "@/lib/types";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfileFavoriteStar({
  profile,
  companyInfo,
}: {
  profile: IFormData;
  companyInfo: ICompanyInfo | null;
}) {
  const supabase = createClient();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (profile && companyInfo) {
      if (
        profile.company_favorites &&
        profile.company_favorites.filter(
          (each) => each.company_id === companyInfo.id
        ).length > 0
      ) {
        setIsFavorite(true);
      }
    }
  }, [profile, companyInfo]);

  const handleFavorite = async () => {
    try {
      let query;

      if (!companyInfo) throw new Error("Company info not found");

      if (
        profile.company_favorites &&
        profile.company_favorites.filter(
          (each) => each.company_id === companyInfo.id
        ).length > 0
      ) {
        query = supabase
          .from("company_favorites")
          .delete()
          .eq("user_info_id", profile.user_id)
          .eq("company_id", companyInfo.id);
      } else
        query = supabase.from("company_favorites").insert([
          {
            user_info_id: profile.user_id,
            company_id: companyInfo.id,
          },
        ]);

      const { error } = await query;

      if (error) throw new Error(error.details);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={() => {
        setIsFavorite(!isFavorite);
        handleFavorite();
      }}
      className="ml-3"
    >
      <Star
        className={`${isFavorite && "fill-black dark:fill-white"} h-5 w-5`}
      />
    </button>
  );
}
