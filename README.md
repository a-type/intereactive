# interreactive

> The missing focus and selection manager for React

## Getting Started

This library provides a variety of tools which enable specific use cases:

### Select / Autocomplete / Combo Box

`interreactive` can power Select-style components, giving you flexibility on DOM structure and implementation details. And you end up with a great semantic structure, free of render-prop noise:

```tsx
<SelectionProvider value={value} onChange={setValue}>
  <SelectInput
    value={inputValue}
    onChange={ev => setInputValue(ev.target.value)}
  />
  <SelectOptions>
    {filteredOptions.map(option => (
      <SelectOption value={option} key={option}>
        {option}
      </SelectOption>
    ))}
  </SelectOptions>
</SelectionProvider>
```

**See [the Select guide](./guides/select.md) to get started.**

### Roving Tab Index

Roving tab index is a low-level technique to move the user's tab position between a grouped set of elements using the keyboard. Whenever focus leaves the group and returns to it, the selected element will still be where the user left it. This is great for constructs like Toggle Buttons, where selection is exclusive and all the buttons should be treated as one focusable widget.

**See [the Roving Tab Index guide](./guides/roving-tab-index.md) to get started**
