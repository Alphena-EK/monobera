"use client";

import React from "react";
import { Tooltip } from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import posthog from "posthog-js";
import { useLocalStorage } from "usehooks-ts";

import { LOCAL_STORAGE_KEYS } from "~/utils/constants";

export enum COOKIES_SETTING {
  OPT_IN = "opt_in",
  OPT_OUT = "opt_out",
  UNDECIDED = "undecided",
}

export default function CookiesSettingsBanner() {
  const [cookiesOptOut, setCookiesOptOut] = useLocalStorage<number | string>(
    LOCAL_STORAGE_KEYS.COOKIES_OPT_OUT,
    COOKIES_SETTING.UNDECIDED,
  );

  const handleAccept = () => {
    setCookiesOptOut(COOKIES_SETTING.OPT_IN);
    posthog.set_config({
      persistence: "localStorage+cookie",
      autocapture: true,
    });
    posthog.opt_in_capturing();
  };

  const handleReject = () => {
    setCookiesOptOut(COOKIES_SETTING.OPT_OUT);
    posthog.set_config({ persistence: "memory", autocapture: false });
    posthog.opt_out_capturing();
  };

  if (
    cookiesOptOut === COOKIES_SETTING.OPT_IN ||
    cookiesOptOut === COOKIES_SETTING.OPT_OUT
  ) {
    return null;
  }

  return (
    <div className="border-1 fixed bottom-4 left-2 right-2 z-50 flex flex-col gap-4 rounded-md border-muted-foreground bg-muted p-4 text-white shadow-lg md:left-4 md:right-4 md:flex-row md:items-center">
      <h4 className="flex flex-1 items-center gap-1 font-sans leading-none">
        Accept Tracking Cookies
        <Tooltip text="We use tracking cookies to understand how you use the product and help us improve it." />
      </h4>
      <div className="flex gap-2 ">
        <Button
          variant="primary"
          className="h-8 px-4 font-sans"
          onClick={handleAccept}
        >
          Accept cookies
        </Button>
        <Button
          variant="secondary"
          className="h-8 px-4 font-sans"
          onClick={handleReject}
        >
          Reject cookies
        </Button>
      </div>
    </div>
  );
}
