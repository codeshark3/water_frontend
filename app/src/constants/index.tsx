export const years = Array.from({ length: 20 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);

export const divisions = [
  "Biomedical and Public Health Research Unit",
  "Environmental Biology & Health Division",
  "Environmental Chemistry and Sanitation Engineering Division",
  "Fishery and Aquaculture Division",
  "Ground Water and Geoscience Division",
  "Surface Water and Climate Change Division",
];
