import type { Category } from "@/types/category.types";

export const MOCK_CATEGORIES: Category[] = [
  {
    idCategory: "category-gaji",
    nameCategory: "Gaji",
    type: "income",
    color: "#22C55E",
    icon: "HiOutlineBriefcase",
    transactionCount: 4,
    subCategories: [],
  },
  {
    idCategory: "category-makan",
    nameCategory: "Makan",
    type: "expense",
    color: "#F97316",
    icon: "IoFastFoodOutline",
    transactionCount: 6,
    subCategories: [
      {
        idSubCategory: "sub-restoran",
        idCategory: "category-makan",
        nameSubCategory: "Restoran",
        icon: "MdOutlineRestaurant",
        transactionCount: 3,
      },
      {
        idSubCategory: "sub-kopi",
        idCategory: "category-makan",
        nameSubCategory: "Kopi",
        icon: "MdOutlineLocalCafe",
        transactionCount: 2,
      },
    ],
  },
  {
    idCategory: "category-transportasi",
    nameCategory: "Transportasi",
    type: "expense",
    color: "#3B82F6",
    icon: "MdOutlineDirectionsCar",
    transactionCount: 3,
    subCategories: [
      {
        idSubCategory: "sub-bensin",
        idCategory: "category-transportasi",
        nameSubCategory: "Bensin",
        icon: "MdOutlineLocalGasStation",
        transactionCount: 2,
      },
      {
        idSubCategory: "sub-ojek",
        idCategory: "category-transportasi",
        nameSubCategory: "Ojek Online",
        icon: "MdOutlineLocalTaxi",
        transactionCount: 1,
      },
    ],
  },
  {
    idCategory: "category-hobi",
    nameCategory: "Hobi",
    type: "expense",
    color: "#A855F7",
    icon: "MdOutlineSportsEsports",
    transactionCount: 2,
    subCategories: [
      {
        idSubCategory: "sub-topup",
        idCategory: "category-hobi",
        nameSubCategory: "Top Up Game",
        icon: "MdOutlineVideogameAsset",
        transactionCount: 2,
      },
    ],
  },
  {
    idCategory: "category-kebutuhan",
    nameCategory: "Kebutuhan",
    type: "expense",
    color: "#EAB308",
    icon: "HiOutlineShoppingCart",
    transactionCount: 3,
    subCategories: [
      {
        idSubCategory: "sub-internet",
        idCategory: "category-kebutuhan",
        nameSubCategory: "Internet",
        icon: "HiOutlineWifi",
        transactionCount: 1,
      },
    ],
  },
];
