import { ColorKey, FlowerType, FlowerTypeId, OccasionKey } from "../types/flowers";

/** 1) Bộ sưu tập hoa (loài) — label + ảnh minh họa */
export const SPECIES: { id: FlowerTypeId; label: string; thumb: string }[] = [
  { id: FlowerType.Roses,         label: "Hoa Hồng",        thumb: "https://images.unsplash.com/photo-1509043759401-136742328bb3?w=400" },
  { id: FlowerType.Tulips,        label: "Hoa Tulip",       thumb: "https://images.unsplash.com/photo-1464965911892-8a99f4a06e0b?w=400" },
  { id: FlowerType.Daisies,       label: "Hoa Cúc",         thumb: "https://images.unsplash.com/photo-1504198266285-165a3c76e0d3?w=400" },
  { id: FlowerType.Lilies,        label: "Hoa Ly",          thumb: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" },
  { id: FlowerType.Orchids,       label: "Lan Hồ Điệp",     thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400" },
  { id: FlowerType.Sunflowers,    label: "Hoa Hướng Dương", thumb: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?w=400" },
  { id: FlowerType.Carnations,    label: "Hoa Cẩm Chướng",  thumb: "https://images.unsplash.com/photo-1447877085163-3cce903855cd?w=400" },
  { id: FlowerType.MixedBouquets, label: "Bó Mix",          thumb: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400" },
];

/** 2) Theo dịp – danh sách hiển thị */
export const OCCASIONS: { key: OccasionKey; label: string }[] = [
  { key: "MOTHERS_DAY",  label: "Ngày Của Mẹ" },
  { key: "WOMEN_DAY",    label: "Ngày Quốc Tế Phụ Nữ" },
  { key: "TET",          label: "Hoa Tết" },
  { key: "CHRISTMAS",    label: "Giáng Sinh" },
  { key: "ANNIVERSARY",  label: "Chúc Mừng Kỷ Niệm" },
  { key: "JUST_BECAUSE", label: "Bất Ngờ Nhỏ" },
];

/** 3) Màu sắc – danh sách hiển thị */
export const COLORS: { key: ColorKey; label: string; hex: string }[] = [
  { key: "BLUE",   label: "Màu Xanh Dương", hex: "#2F80ED" },
  { key: "PINK",   label: "Màu Hồng",       hex: "#F48FB1" },
  { key: "RED",    label: "Màu Đỏ",         hex: "#EB5757" },
  { key: "YELLOW", label: "Màu Vàng",       hex: "#F2C94C" },
];

/** Map: loài → list dịp gợi ý */
export const TYPE_TO_OCCASIONS: Record<FlowerTypeId, OccasionKey[]> = {
  [FlowerType.Roses]:         ["ANNIVERSARY", "WOMEN_DAY", "MOTHERS_DAY", "JUST_BECAUSE"],
  [FlowerType.Tulips]:        ["ANNIVERSARY", "WOMEN_DAY", "JUST_BECAUSE"],
  [FlowerType.Daisies]:       ["MOTHERS_DAY", "JUST_BECAUSE"],
  [FlowerType.Lilies]:        ["ANNIVERSARY", "WOMEN_DAY", "MOTHERS_DAY"],
  [FlowerType.Orchids]:       ["ANNIVERSARY", "WOMEN_DAY", "JUST_BECAUSE"],
  [FlowerType.Sunflowers]:    ["TET", "JUST_BECAUSE"],
  [FlowerType.Carnations]:    ["ANNIVERSARY", "JUST_BECAUSE"],
  [FlowerType.MixedBouquets]: ["ANNIVERSARY", "WOMEN_DAY", "MOTHERS_DAY", "TET", "JUST_BECAUSE"],
};

/** Map: loài → màu phổ biến (fallback nếu sản phẩm không có colorKey riêng) */
export const TYPE_TO_COLORS: Record<FlowerTypeId, ColorKey[]> = {
  [FlowerType.Roses]:         ["RED", "PINK", "YELLOW"],
  [FlowerType.Tulips]:        ["PINK", "YELLOW", "RED"],
  [FlowerType.Daisies]:       ["PINK", "YELLOW"],
  [FlowerType.Lilies]:        ["PINK"], // có WHITE ngoài scope
  [FlowerType.Orchids]:       ["PINK", "RED"],
  [FlowerType.Sunflowers]:    ["YELLOW"],
  [FlowerType.Carnations]:    ["RED", "PINK"],
  [FlowerType.MixedBouquets]: ["RED", "PINK", "YELLOW", "BLUE"],
};
