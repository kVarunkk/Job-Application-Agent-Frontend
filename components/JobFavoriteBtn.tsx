"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function JobFavoriteBtn({
  isCompanyUser,
  user,
  userFavorites,
  job_id,
}: //   isFavorite,
{
  isCompanyUser: boolean;
  user: User | null;
  userFavorites: {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    job_id: string;
  }[];
  job_id: string;
  //   isFavorite: boolean;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user && userFavorites) {
      setIsFavorite(
        userFavorites.filter((each) => each.user_id === user?.id).length > 0
      );
    }
  }, [userFavorites, user]);

  const handleFavorite = async () => {
    try {
      let query;

      if (
        userFavorites?.filter((each) => each.user_id === user?.id).length > 0
      ) {
        query = supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user?.id)
          .eq("job_id", job_id);
      } else
        query = supabase.from("user_favorites").insert([
          {
            user_id: user?.id,
            job_id: job_id,
          },
        ]);

      const { error } = await query;

      if (error) throw new Error(error.details);
    } catch {}
  };
  return (
    <div className="!ml-3 inline-block align-middle">
      {isCompanyUser ? (
        ""
      ) : user ? (
        <button
          onClick={(e) => {
            // e.preventDefault();
            e.stopPropagation();
            setIsFavorite(!isFavorite);
            handleFavorite();
          }}
          //   className="ml-3"
        >
          <Star
            //   fill={isFavorite ? 'white' : "transparent"}
            className={`${isFavorite && "fill-black dark:fill-white"} h-5 w-5`}
          />
        </button>
      ) : (
        <Link
          onClick={(e) => e.stopPropagation()}
          href={"/auth/sign-up"}
          //   className="ml-3"
        >
          <Star className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}
