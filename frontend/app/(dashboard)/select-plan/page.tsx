"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PricingCard from "@/components/ui/PricingCard";
const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type Plan = {
  _id: string;
  name: string;
  type: string;
  price: number;
  billingCycle: string;
  features: string[];
  featured: boolean;
};

const PricingSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${serverBaseUrl}/user/plan/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        const msg = data.message || "Failed to fetch plans";
        return toast.error(msg);
      } else {
        const responsePayload = data.response;
        if (Array.isArray(responsePayload)) {
          setPlans(responsePayload);
          setTotalDiscount(0);
        } else {
          setPlans(responsePayload?.plans ?? []);
          setTotalDiscount(Number(responsePayload?.totalDiscount) || 0);
        }
      }
    } catch {
      toast.error("Failed to fetch plans");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[url('/assets/letter-image.png')] bg-cover bg-center">
      <div className="relative z-10 px-4 py-8 sm:px-8 sm:py-10">
        <div className="relative flex bg-[#F1FAEE]/95 backdrop-blur-sm rounded-2xl flex-col items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden shadow-xl border border-white/40">
          <div className="bg-[url('/assets/letter-image.png')] rounded-t-2xl w-full h-64 bg-cover bg-center flex justify-center items-center">
            <button
              type="button"
              aria-label="Cancel"
              onClick={() => router.push("/landing-page")}
              className="absolute top-5 right-5 h-10 w-10 rounded-full bg-white/20 text-white text-2xl leading-none flex items-center justify-center"
            >
              ×
            </button>
            <div className="text-center text-white px-4 py-12">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 font-[Cormorant_Garamond]">
                How do you want to continue?
              </h1>
              <p className="text-lg sm:text-xl text-white/90">
                Choose which plan is right for you
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl px-6 sm:px-10 pb-14">
            {totalDiscount > 0 && (
              <div className="mt-8 mx-auto max-w-3xl rounded-xl border border-[#457B9D]/30 bg-[#E8F4F8] px-5 py-4 text-center shadow-sm">
                <p className="text-[#1D3557] text-sm sm:text-base font-medium">
                  You have{" "}
                  <span className="font-bold text-[#457B9D]">
                    ${totalDiscount.toFixed(2)}
                  </span>{" "}
                  in account credit. It will be applied to your plan at
                  checkout.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-10 items-stretch">
              {plans.map((plan, idx) => (
                <PricingCard
                  key={plan._id ?? idx}
                  plan={plan}
                  totalDiscount={totalDiscount}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
