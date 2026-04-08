/** Типы для подсказок (DS-575 Hints) */

export interface HintRecommendation {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  discountedPrice: number | null;
  discountName: string | null;
  discountAmount: number | null;
  attributes: string[];
}

export interface HintData {
  id: string;
  title: string;
  slogan: string;
  description: string;
  imageUrl: string | null;
  recommendation: HintRecommendation;
}

export interface OrderDish {
  id: string;
  name: string;
  price: number;
  qty: number;
  category: string;
  isCategory?: boolean;
}
