import data from "./catalog-data.json";
export const calculators = data;
export const categories = [...new Set(data.map(c => c.category))];
export const routeFor = (id: string) => data.find(c => c.id === id)?.local_route ?? "/financial-calculator.html";
