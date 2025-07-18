'use client';

import React, { useState, useEffect } from "react";
import {
  Combobox,
  InputBase,
  useCombobox
} from "@mantine/core";
import type { DrinkCatalogItem } from "../../../../types/common";

interface GroupedOptions {
  label: string;
  options: DrinkCatalogItem[];
}

interface HabitComboboxProps {
  options?: DrinkCatalogItem[];
  value?: DrinkCatalogItem[];
  onChange: (option: DrinkCatalogItem | string) => void;
  placeholder?: string;
  resetCombobox?: (resetFn: () => void) => void;
}

const HabitCombobox: React.FC<HabitComboboxProps> = ({ 
  options = [], 
  onChange, 
  placeholder = "Pick drinks", 
  resetCombobox 
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState<string>("");

  // Ensure options is always an array
  const filteredOptions = Array.isArray(options)
    ? options.filter((option) => !option.archived && option.catalog_type === "generic")
    : [];

  // Group by drink_type
  const groupedOptions = filteredOptions.reduce((acc: Record<string, DrinkCatalogItem[]>, option) => {
    const group = option.drink_type || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {});

  // Apply search filter to each group
  const filteredGroups: GroupedOptions[] = Object.entries(groupedOptions).map(([group, opts]) => ({
    label: group,
    options: (opts as DrinkCatalogItem[]).filter((opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase().trim())
    ),
  }));

  const totalOptions = filteredGroups.reduce((sum, g) => sum + g.options.length, 0);

  // Reset support
  useEffect(() => {
    if (resetCombobox) {
      resetCombobox(() => {
        setSearch("");
        combobox.resetSelectedOption();
      });
    }
  }, [resetCombobox, combobox]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val: string) => {
        if (val === "__create") {
          onChange(search.trim());
        } else {
          const selectedOption = filteredOptions.find((option) => option.id.toString() === val);
          if (selectedOption) {
            onChange(selectedOption);
          }
        }
        setSearch(""); // Reset search
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onClick={() => combobox.toggleDropdown()}
        >
          {placeholder}
        </InputBase>

      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search or create…" />
        <Combobox.Options>
          {filteredGroups.map((group: GroupedOptions) => (
            <Combobox.Group label={group.label} key={group.label}>
              {group.options.map((option: DrinkCatalogItem) => (
                <Combobox.Option key={option.id} value={option.id.toString()}>
                  {option.icon} {option.name}
                </Combobox.Option>
              ))}
            </Combobox.Group>
          ))}

          {search.trim() && !filteredOptions.some((o) =>
            o.name.toLowerCase() === search.trim().toLowerCase()
          ) && (
              <Combobox.Option value="__create">+ Create "{search.trim()}"</Combobox.Option>
            )}

          {totalOptions === 0 && <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default HabitCombobox; 