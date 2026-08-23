import { supportedLanguages, useTranslation } from "@chacelow-generated/i18n/react";
import { Check, Languages } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Switch language"
          className="scale-95 rounded-full"
          size="icon"
          variant="ghost"
        >
          <Languages className="size-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <LanguageItem
            active={i18n.resolvedLanguage === language.value}
            key={language.value}
            label={language.label}
            onChange={i18n.changeLanguage}
            value={language.value}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageItem({
  active,
  label,
  onChange,
  value,
}: {
  active: boolean;
  label: string;
  onChange: (language: string) => Promise<unknown>;
  value: string;
}) {
  const selectLanguage = useCallback(() => onChange(value), [onChange, value]);
  return (
    <DropdownMenuItem onClick={selectLanguage}>
      {label}
      <Check className={cn("ms-auto", !active && "hidden")} size={14} />
    </DropdownMenuItem>
  );
}
