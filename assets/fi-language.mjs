// Finnish cardinal phrases use the nominative singular only for ±1.
// Keep inflection local to controlled UI copy; never rewrite personal text.
export const countForm=(value,singular,partitive)=>Math.abs(Number(value))===1?singular:partitive;
export const quantity=(value,singular,partitive)=>Number(value).toLocaleString('fi-FI')+' '+countForm(value,singular,partitive);
