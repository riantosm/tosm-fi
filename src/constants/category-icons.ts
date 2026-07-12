import type { IconType } from "react-icons";
import {
  HiOutlineArchiveBox,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineBolt,
  HiOutlineBriefcase,
  HiOutlineBuildingLibrary,
  HiOutlineCamera,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineClipboardDocumentList,
  HiOutlineCreditCard,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineFilm,
  HiOutlineFire,
  HiOutlineFlag,
  HiOutlineFolder,
  HiOutlineGiftTop,
  HiOutlineHandThumbUp,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineMap,
  HiOutlineMapPin,
  HiOutlineMusicalNote,
  HiOutlinePhone,
  HiOutlinePlayCircle,
  HiOutlinePuzzlePiece,
  HiOutlineQrCode,
  HiOutlineQuestionMarkCircle,
  HiOutlineReceiptPercent,
  HiOutlineReceiptRefund,
  HiOutlineRocketLaunch,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineTag,
  HiOutlineTicket,
  HiOutlineTrophy,
  HiOutlineTruck,
  HiOutlineVideoCamera,
  HiOutlineWallet,
  HiOutlineWifi,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { IoFastFoodOutline } from "react-icons/io5";
import {
  MdOutlineBakeryDining,
  MdOutlineCheckroom,
  MdOutlineCreditScore,
  MdOutlineCurrencyExchange,
  MdOutlineDiamond,
  MdOutlineDirectionsBus,
  MdOutlineDirectionsCar,
  MdOutlineFlatware,
  MdOutlineIcecream,
  MdOutlineLocalCafe,
  MdOutlineLocalGasStation,
  MdOutlineLocalPizza,
  MdOutlineLocalTaxi,
  MdOutlinePayments,
  MdOutlineRestaurant,
  MdOutlineSportsEsports,
  MdOutlineTwoWheeler,
  MdOutlineVideogameAsset,
  MdOutlineWatch,
} from "react-icons/md";

export interface CategoryIconOption {
  name: string;
  icon: IconType;
  labelKey: string;
}

export interface CategoryIconGroup {
  key: string;
  titleKey: string;
  icons: CategoryIconOption[];
}

export const CATEGORY_ICON_GROUPS: CategoryIconGroup[] = [
  {
    key: "general",
    titleKey: "category.iconGroups.general",
    icons: [
      { name: "HiOutlineTag", icon: HiOutlineTag, labelKey: "tag" },
      { name: "HiOutlineStar", icon: HiOutlineStar, labelKey: "star" },
      { name: "HiOutlineFolder", icon: HiOutlineFolder, labelKey: "folder" },
      { name: "HiOutlineArchiveBox", icon: HiOutlineArchiveBox, labelKey: "archive" },
      {
        name: "HiOutlineClipboardDocumentList",
        icon: HiOutlineClipboardDocumentList,
        labelKey: "checklist",
      },
      { name: "HiOutlineFlag", icon: HiOutlineFlag, labelKey: "flag" },
      { name: "HiOutlineQuestionMarkCircle", icon: HiOutlineQuestionMarkCircle, labelKey: "other" },
      { name: "HiOutlineDocumentText", icon: HiOutlineDocumentText, labelKey: "document" },
    ],
  },
  {
    key: "food",
    titleKey: "category.iconGroups.food",
    icons: [
      { name: "IoFastFoodOutline", icon: IoFastFoodOutline, labelKey: "food" },
      { name: "MdOutlineRestaurant", icon: MdOutlineRestaurant, labelKey: "restaurant" },
      { name: "MdOutlineFlatware", icon: MdOutlineFlatware, labelKey: "cutlery" },
      { name: "MdOutlineLocalCafe", icon: MdOutlineLocalCafe, labelKey: "cafe" },
      { name: "MdOutlineBakeryDining", icon: MdOutlineBakeryDining, labelKey: "bakery" },
      { name: "MdOutlineLocalPizza", icon: MdOutlineLocalPizza, labelKey: "pizza" },
      { name: "MdOutlineIcecream", icon: MdOutlineIcecream, labelKey: "dessert" },
      { name: "HiOutlineFire", icon: HiOutlineFire, labelKey: "cooking" },
    ],
  },
  {
    key: "dailyNeeds",
    titleKey: "category.iconGroups.dailyNeeds",
    icons: [
      { name: "MdOutlineCheckroom", icon: MdOutlineCheckroom, labelKey: "clothing" },
      { name: "HiOutlineWifi", icon: HiOutlineWifi, labelKey: "internet" },
      { name: "HiOutlineShoppingCart", icon: HiOutlineShoppingCart, labelKey: "groceries" },
      { name: "HiOutlineShoppingBag", icon: HiOutlineShoppingBag, labelKey: "shoppingBag" },
      { name: "MdOutlineWatch", icon: MdOutlineWatch, labelKey: "accessories" },
      { name: "MdOutlineDiamond", icon: MdOutlineDiamond, labelKey: "jewelry" },
      { name: "HiOutlineHome", icon: HiOutlineHome, labelKey: "home" },
      { name: "HiOutlineHomeModern", icon: HiOutlineHomeModern, labelKey: "household" },
      { name: "HiOutlineBolt", icon: HiOutlineBolt, labelKey: "electricity" },
      { name: "HiOutlinePhone", icon: HiOutlinePhone, labelKey: "phoneBill" },
      { name: "HiOutlineWrenchScrewdriver", icon: HiOutlineWrenchScrewdriver, labelKey: "repair" },
      { name: "HiOutlineReceiptPercent", icon: HiOutlineReceiptPercent, labelKey: "discount" },
      { name: "HiOutlineTicket", icon: HiOutlineTicket, labelKey: "voucher" },
      { name: "HiOutlineGiftTop", icon: HiOutlineGiftTop, labelKey: "giftBox" },
    ],
  },
  {
    key: "transport",
    titleKey: "category.iconGroups.transport",
    icons: [
      { name: "MdOutlineDirectionsCar", icon: MdOutlineDirectionsCar, labelKey: "car" },
      { name: "MdOutlineTwoWheeler", icon: MdOutlineTwoWheeler, labelKey: "motorcycle" },
      { name: "MdOutlineDirectionsBus", icon: MdOutlineDirectionsBus, labelKey: "bus" },
      { name: "MdOutlineLocalGasStation", icon: MdOutlineLocalGasStation, labelKey: "fuel" },
      { name: "MdOutlineLocalTaxi", icon: MdOutlineLocalTaxi, labelKey: "taxi" },
      { name: "HiOutlineMapPin", icon: HiOutlineMapPin, labelKey: "location" },
      { name: "HiOutlineMap", icon: HiOutlineMap, labelKey: "route" },
      { name: "HiOutlineTruck", icon: HiOutlineTruck, labelKey: "delivery" },
    ],
  },
  {
    key: "hobby",
    titleKey: "category.iconGroups.hobby",
    icons: [
      { name: "MdOutlineSportsEsports", icon: MdOutlineSportsEsports, labelKey: "esports" },
      { name: "MdOutlineVideogameAsset", icon: MdOutlineVideogameAsset, labelKey: "gameTopup" },
      { name: "HiOutlinePuzzlePiece", icon: HiOutlinePuzzlePiece, labelKey: "games" },
      { name: "HiOutlineMusicalNote", icon: HiOutlineMusicalNote, labelKey: "music" },
      { name: "HiOutlineFilm", icon: HiOutlineFilm, labelKey: "movie" },
      { name: "HiOutlineCamera", icon: HiOutlineCamera, labelKey: "photography" },
      { name: "HiOutlineTrophy", icon: HiOutlineTrophy, labelKey: "sports" },
      { name: "HiOutlinePlayCircle", icon: HiOutlinePlayCircle, labelKey: "streaming" },
      { name: "HiOutlineVideoCamera", icon: HiOutlineVideoCamera, labelKey: "video" },
    ],
  },
  {
    key: "paymentOther",
    titleKey: "category.iconGroups.paymentOther",
    icons: [
      { name: "HiOutlineCreditCard", icon: HiOutlineCreditCard, labelKey: "creditCard" },
      { name: "MdOutlineCreditScore", icon: MdOutlineCreditScore, labelKey: "debitCard" },
      { name: "HiOutlineBanknotes", icon: HiOutlineBanknotes, labelKey: "cash" },
      { name: "HiOutlineQrCode", icon: HiOutlineQrCode, labelKey: "digitalPayment" },
      { name: "HiOutlineWallet", icon: HiOutlineWallet, labelKey: "wallet" },
      { name: "HiOutlineBuildingLibrary", icon: HiOutlineBuildingLibrary, labelKey: "bank" },
      { name: "HiOutlineReceiptRefund", icon: HiOutlineReceiptRefund, labelKey: "refund" },
      { name: "MdOutlinePayments", icon: MdOutlinePayments, labelKey: "payment" },
    ],
  },
  {
    key: "investment",
    titleKey: "category.iconGroups.investment",
    icons: [
      { name: "HiOutlineChartPie", icon: HiOutlineChartPie, labelKey: "investment" },
      { name: "HiOutlineChartBar", icon: HiOutlineChartBar, labelKey: "chart" },
      { name: "HiOutlineArrowTrendingUp", icon: HiOutlineArrowTrendingUp, labelKey: "profit" },
      { name: "HiOutlineCurrencyDollar", icon: HiOutlineCurrencyDollar, labelKey: "money" },
      { name: "HiOutlineBriefcase", icon: HiOutlineBriefcase, labelKey: "job" },
      { name: "HiOutlineRocketLaunch", icon: HiOutlineRocketLaunch, labelKey: "business" },
      { name: "HiOutlineHandThumbUp", icon: HiOutlineHandThumbUp, labelKey: "bonus" },
      { name: "MdOutlineCurrencyExchange", icon: MdOutlineCurrencyExchange, labelKey: "exchange" },
    ],
  },
];

export const CATEGORY_ICONS: CategoryIconOption[] = CATEGORY_ICON_GROUPS.flatMap(
  (group) => group.icons,
);

export function resolveCategoryIcon(name: string): IconType {
  return CATEGORY_ICONS.find((option) => option.name === name)?.icon ?? HiOutlineTag;
}
