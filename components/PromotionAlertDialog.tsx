"use client";

import * as React from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PromotionDialogContent {
  title: string;
  description: string;
  confirmButtonLabel: string;
  featureHighlight?: string;
}

interface PromotionAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: { last_promo_version_seen: string }) => Promise<void>;
  textContent: PromotionDialogContent;
  customContent?: React.ReactNode;
  promoImage?: string;
  currentDialogId: string;
}

export default function PromotionAlertDialog({
  isOpen,
  onClose,
  onUpdate,
  textContent,
  customContent,
  promoImage,
  currentDialogId,
}: PromotionAlertDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);

    const updates = {
      last_promo_version_seen: currentDialogId,
    };

    await onUpdate(updates);

    setIsLoading(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{textContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {textContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {promoImage && (
          <div className="my-4 rounded-lg overflow-hidden border">
            <Image
              src={promoImage}
              alt={textContent.title || "Feature Update"}
              width={400}
              height={200}
              layout="responsive"
              objectFit="cover"
            />
          </div>
        )}

        {textContent.featureHighlight && (
          <div className=" p-4 border  rounded-md bg-secondary">
            {textContent.featureHighlight}
          </div>
        )}

        {customContent && <div className="py-2  ">{customContent}</div>}

        <AlertDialogFooter className="mt-4">
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : textContent.confirmButtonLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
