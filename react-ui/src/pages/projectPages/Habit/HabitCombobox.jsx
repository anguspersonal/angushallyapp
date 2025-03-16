import React, { useState, useEffect } from "react";
import { Combobox, InputBase, useCombobox } from "@mantine/core";

function HabitCombobox({ options, value, onChange, placeholder = "Pick an option", resetCombobox }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [search, setSearch] = useState("");

  // ✅ Filter & sort items before grouping
  const filteredOptions = options
    .filter((option) => !option.archived && option.catalog_type === "generic") // ✅ Exclude archived & only keep "generic"
    .sort((a, b) => b.count - a.count); // ✅ Sort by count (highest first)

  // ✅ Group options by `drink_type`
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const drinkType = option.drink_type || "Other"; // ✅ Ensure drink_type is always a string
    if (!acc[drinkType]) {
      acc[drinkType] = [];
    }
    acc[drinkType].push(option);
    return acc;
  }, {});

  // ✅ Filter options based on search input
  const filteredGroups = Object.keys(groupedOptions).map((group) => {
    const groupOptions = groupedOptions[group].filter((option) =>
      option.name.toLowerCase().includes(search.toLowerCase().trim())
    );

    return { label: String(group), options: groupOptions }; // ✅ Convert to string to prevent React error
  });

  // ✅ Count total options to check if "Nothing found" should be displayed
  const totalOptions = filteredGroups.reduce((acc, group) => acc + group.options.length, 0);

  // ✅ Generate grouped dropdown options
  const groups = filteredGroups.map((group) => {
    const optionsList = group.options.map((option) => (
      <Combobox.Option value={option.id.toString()} key={option.id}>
        {option.icon} {option.name} {/* ✅ Display icon + name */}
      </Combobox.Option>
    ));

    return (
      <Combobox.Group label={String(group.label)} key={group.label}> {/* ✅ Convert to string */}
        {optionsList}
      </Combobox.Group>
    );
  });

  // ✅ Reset the combobox state
  const handleReset = () => {
    console.log("Resetting combobox");
    setSearch("");
    combobox.resetSelectedOption();
  };

  // Call the reset function when the component mounts
  useEffect(() => {
    if (resetCombobox) {
      resetCombobox(handleReset);
    }
  }, [resetCombobox]);

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        const selectedOption = filteredOptions.find((option) => option.id.toString() === val);
        onChange(selectedOption);
        setSearch(selectedOption ? selectedOption.name : "");
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
          {value ? `${value.icon} ${value.name}` : placeholder}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {totalOptions > 0 ? groups : <Combobox.Empty>Nothing found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default HabitCombobox;
