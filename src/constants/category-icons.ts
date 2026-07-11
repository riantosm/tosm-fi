import type { IconType } from "react-icons";
import {
  HiOutlineAcademicCap,
  HiOutlineArchiveBox,
  HiOutlineArrowTrendingUp,
  HiOutlineBanknotes,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineBookOpen,
  HiOutlineBriefcase,
  HiOutlineBuildingLibrary,
  HiOutlineBuildingStorefront,
  HiOutlineCake,
  HiOutlineCamera,
  HiOutlineChartBar,
  HiOutlineChartPie,
  HiOutlineClipboardDocumentList,
  HiOutlineCloud,
  HiOutlineComputerDesktop,
  HiOutlineCpuChip,
  HiOutlineCreditCard,
  HiOutlineDevicePhoneMobile,
  HiOutlineDeviceTablet,
  HiOutlineDocumentText,
  HiOutlineFaceSmile,
  HiOutlineFilm,
  HiOutlineFire,
  HiOutlineFlag,
  HiOutlineFolder,
  HiOutlineGift,
  HiOutlineGiftTop,
  HiOutlineGlobeAlt,
  HiOutlineGlobeAmericas,
  HiOutlineHandThumbUp,
  HiOutlineHeart,
  HiOutlineHome,
  HiOutlineHomeModern,
  HiOutlineLifebuoy,
  HiOutlineMap,
  HiOutlineMapPin,
  HiOutlineMusicalNote,
  HiOutlinePaintBrush,
  HiOutlinePaperAirplane,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlinePlayCircle,
  HiOutlinePuzzlePiece,
  HiOutlineQrCode,
  HiOutlineQuestionMarkCircle,
  HiOutlineReceiptPercent,
  HiOutlineReceiptRefund,
  HiOutlineRocketLaunch,
  HiOutlineScissors,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineSun,
  HiOutlineSwatch,
  HiOutlineTag,
  HiOutlineTicket,
  HiOutlineTrophy,
  HiOutlineTruck,
  HiOutlineTv,
  HiOutlineUser,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineVideoCamera,
  HiOutlineWallet,
  HiOutlineWifi,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";

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
    key: "income",
    titleKey: "category.iconGroups.income",
    icons: [
      { name: "HiOutlineBriefcase", icon: HiOutlineBriefcase, labelKey: "job" },
      { name: "HiOutlineBanknotes", icon: HiOutlineBanknotes, labelKey: "cash" },
      { name: "HiOutlineWallet", icon: HiOutlineWallet, labelKey: "wallet" },
      { name: "HiOutlineBuildingLibrary", icon: HiOutlineBuildingLibrary, labelKey: "bank" },
      { name: "HiOutlineArrowTrendingUp", icon: HiOutlineArrowTrendingUp, labelKey: "profit" },
      { name: "HiOutlineChartPie", icon: HiOutlineChartPie, labelKey: "investment" },
      { name: "HiOutlineChartBar", icon: HiOutlineChartBar, labelKey: "chart" },
      { name: "HiOutlineRocketLaunch", icon: HiOutlineRocketLaunch, labelKey: "business" },
      { name: "HiOutlineReceiptRefund", icon: HiOutlineReceiptRefund, labelKey: "refund" },
      { name: "HiOutlineHandThumbUp", icon: HiOutlineHandThumbUp, labelKey: "bonus" },
    ],
  },
  {
    key: "food",
    titleKey: "category.iconGroups.food",
    icons: [
      { name: "HiOutlineCake", icon: HiOutlineCake, labelKey: "food" },
      { name: "HiOutlineBuildingStorefront", icon: HiOutlineBuildingStorefront, labelKey: "restaurant" },
      { name: "HiOutlineShoppingCart", icon: HiOutlineShoppingCart, labelKey: "groceries" },
      { name: "HiOutlineFire", icon: HiOutlineFire, labelKey: "cooking" },
    ],
  },
  {
    key: "shopping",
    titleKey: "category.iconGroups.shopping",
    icons: [
      { name: "HiOutlineShoppingBag", icon: HiOutlineShoppingBag, labelKey: "shoppingBag" },
      { name: "HiOutlineReceiptPercent", icon: HiOutlineReceiptPercent, labelKey: "discount" },
      { name: "HiOutlineCreditCard", icon: HiOutlineCreditCard, labelKey: "creditCard" },
      { name: "HiOutlineGiftTop", icon: HiOutlineGiftTop, labelKey: "giftBox" },
      { name: "HiOutlineTicket", icon: HiOutlineTicket, labelKey: "voucher" },
    ],
  },
  {
    key: "homeBills",
    titleKey: "category.iconGroups.homeBills",
    icons: [
      { name: "HiOutlineHome", icon: HiOutlineHome, labelKey: "home" },
      { name: "HiOutlineHomeModern", icon: HiOutlineHomeModern, labelKey: "household" },
      { name: "HiOutlineBolt", icon: HiOutlineBolt, labelKey: "electricity" },
      { name: "HiOutlineWifi", icon: HiOutlineWifi, labelKey: "internet" },
      { name: "HiOutlinePhone", icon: HiOutlinePhone, labelKey: "phoneBill" },
      { name: "HiOutlineWrenchScrewdriver", icon: HiOutlineWrenchScrewdriver, labelKey: "repair" },
      { name: "HiOutlineDevicePhoneMobile", icon: HiOutlineDevicePhoneMobile, labelKey: "mobile" },
    ],
  },
  {
    key: "transport",
    titleKey: "category.iconGroups.transport",
    icons: [
      { name: "HiOutlineTruck", icon: HiOutlineTruck, labelKey: "delivery" },
      { name: "HiOutlineMapPin", icon: HiOutlineMapPin, labelKey: "location" },
      { name: "HiOutlineMap", icon: HiOutlineMap, labelKey: "route" },
    ],
  },
  {
    key: "health",
    titleKey: "category.iconGroups.health",
    icons: [
      { name: "HiOutlineHeart", icon: HiOutlineHeart, labelKey: "health" },
      { name: "HiOutlineShieldCheck", icon: HiOutlineShieldCheck, labelKey: "insurance" },
      { name: "HiOutlineShieldExclamation", icon: HiOutlineShieldExclamation, labelKey: "emergency" },
      { name: "HiOutlineBeaker", icon: HiOutlineBeaker, labelKey: "medicine" },
      { name: "HiOutlineLifebuoy", icon: HiOutlineLifebuoy, labelKey: "support" },
    ],
  },
  {
    key: "education",
    titleKey: "category.iconGroups.education",
    icons: [
      { name: "HiOutlineAcademicCap", icon: HiOutlineAcademicCap, labelKey: "education" },
      { name: "HiOutlineBookOpen", icon: HiOutlineBookOpen, labelKey: "books" },
      { name: "HiOutlinePencilSquare", icon: HiOutlinePencilSquare, labelKey: "stationery" },
    ],
  },
  {
    key: "entertainment",
    titleKey: "category.iconGroups.entertainment",
    icons: [
      { name: "HiOutlineFilm", icon: HiOutlineFilm, labelKey: "movie" },
      { name: "HiOutlineTv", icon: HiOutlineTv, labelKey: "tv" },
      { name: "HiOutlineMusicalNote", icon: HiOutlineMusicalNote, labelKey: "music" },
      { name: "HiOutlinePuzzlePiece", icon: HiOutlinePuzzlePiece, labelKey: "games" },
      { name: "HiOutlineCamera", icon: HiOutlineCamera, labelKey: "photography" },
      { name: "HiOutlineTrophy", icon: HiOutlineTrophy, labelKey: "sports" },
      { name: "HiOutlinePlayCircle", icon: HiOutlinePlayCircle, labelKey: "streaming" },
      { name: "HiOutlineVideoCamera", icon: HiOutlineVideoCamera, labelKey: "video" },
    ],
  },
  {
    key: "electronics",
    titleKey: "category.iconGroups.electronics",
    icons: [
      { name: "HiOutlineComputerDesktop", icon: HiOutlineComputerDesktop, labelKey: "computer" },
      { name: "HiOutlineDeviceTablet", icon: HiOutlineDeviceTablet, labelKey: "tablet" },
      { name: "HiOutlineCpuChip", icon: HiOutlineCpuChip, labelKey: "gadget" },
      { name: "HiOutlineCloud", icon: HiOutlineCloud, labelKey: "subscription" },
      { name: "HiOutlineQrCode", icon: HiOutlineQrCode, labelKey: "digitalPayment" },
    ],
  },
  {
    key: "family",
    titleKey: "category.iconGroups.family",
    icons: [
      { name: "HiOutlineUsers", icon: HiOutlineUsers, labelKey: "family" },
      { name: "HiOutlineUserGroup", icon: HiOutlineUserGroup, labelKey: "social" },
      { name: "HiOutlineUser", icon: HiOutlineUser, labelKey: "personal" },
      { name: "HiOutlineGift", icon: HiOutlineGift, labelKey: "gift" },
      { name: "HiOutlineFaceSmile", icon: HiOutlineFaceSmile, labelKey: "fun" },
    ],
  },
  {
    key: "beauty",
    titleKey: "category.iconGroups.beauty",
    icons: [
      { name: "HiOutlineSparkles", icon: HiOutlineSparkles, labelKey: "beauty" },
      { name: "HiOutlineScissors", icon: HiOutlineScissors, labelKey: "haircut" },
      { name: "HiOutlinePaintBrush", icon: HiOutlinePaintBrush, labelKey: "cosmetics" },
      { name: "HiOutlineSwatch", icon: HiOutlineSwatch, labelKey: "style" },
    ],
  },
  {
    key: "travel",
    titleKey: "category.iconGroups.travel",
    icons: [
      { name: "HiOutlinePaperAirplane", icon: HiOutlinePaperAirplane, labelKey: "flight" },
      { name: "HiOutlineGlobeAlt", icon: HiOutlineGlobeAlt, labelKey: "travel" },
      { name: "HiOutlineGlobeAmericas", icon: HiOutlineGlobeAmericas, labelKey: "vacation" },
      { name: "HiOutlineSun", icon: HiOutlineSun, labelKey: "holiday" },
    ],
  },
];

export const CATEGORY_ICONS: CategoryIconOption[] = CATEGORY_ICON_GROUPS.flatMap(
  (group) => group.icons,
);

export function resolveCategoryIcon(name: string): IconType {
  return CATEGORY_ICONS.find((option) => option.name === name)?.icon ?? HiOutlineTag;
}
