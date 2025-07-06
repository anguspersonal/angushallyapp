import React, { useState, useEffect } from "react";
import {
  Combobox,
  InputBase,
  useCombobox,
  Group,
  Text,
  Badge
} from "@mantine/core";

function HabitCombobox({ options = [], value = [], onChange, placeholder = "Pick drinks", resetCombobox }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");
  const [selectedDrinks, setSelectedDrinks] = useState(value);

  // ✅ Ensure options is always an array
  const filteredOptions = Array.isArray(options)
    ? options.filter((option) => !option.archived && option.catalog_type === "generic")
    : [];

  // ✅ Group by drink_type
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.drink_type || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {});

  // ✅ Apply search filter to each group
  const filteredGroups = Object.entries(groupedOptions).map(([group, opts]) => ({
    label: group,
    options: opts.filter((opt) =>
      opt.name.toLowerCase().includes(search.toLowerCase().trim())
    ),
  }));

  const totalOptions = filteredGroups.reduce((sum, g) => sum + g.options.length, 0);

  // ✅ Add a new drink to selected list
  const addDrink = (option) => {
    if (!selectedDrinks.some((d) => d.id === option.id)) {
      const newDrink = {
        id: option.id,
        name: option.name,
        icon: option.icon,
        group: option.drink_type || "Other",
        volumeML: option.default_volume_ml || 250,
        abvPerc: option.default_abv || 12,
      };
      const updated = [...selectedDrinks, newDrink];
      setSelectedDrinks(updated);
      onChange(updated); // send full array to parent
    }
  };

  // ✅ Handle Creatable Drink
  const handleCreate = (query) => {
    const id = `custom-${Date.now()}`;
    const newDrink = {
      id,
      name: query,
      icon: "🍹",
      group: "Custom",
      volumeML: 250,
      abvPerc: 12,
    };
    const updated = [...selectedDrinks, newDrink];
    setSelectedDrinks(updated);
    onChange(updated);
    setSearch("");
    combobox.closeDropdown();
  };

  // ✅ Reset support
  useEffect(() => {
    if (resetCombobox) {
      resetCombobox(() => {
        setSelectedDrinks([]);
        setSearch("");
        combobox.resetSelectedOption();
      });
    }
  }, [resetCombobox]);

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        const selectedOption = filteredOptions.find((option) => option.id.toString() === val);
        if (selectedOption) {
          onChange(selectedOption);
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
          {filteredGroups.map((group) => (
            <Combobox.Group label={group.label} key={group.label}>
              {group.options.map((option) => (
                <Combobox.Option key={option.id} value={option.id.toString()}>
                  {option.icon} {option.name}
                </Combobox.Option>
              ))}
            </Combobox.Group>
          ))}

          {search.trim() && !filteredOptions.some((o) =>
            o.name.toLowerCase() === search.trim().toLowerCase()
          ) && (
              <Combobox.Option value="__create">+ Create “{search.trim()}”</Combobox.Option>
            )}

          {totalOptions === 0 && <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default HabitCombobox;
