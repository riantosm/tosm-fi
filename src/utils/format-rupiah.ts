/** Plan prices are always IDR, whatever display currency the user picked: "Rp149.000". */
export const formatRupiah = (amount: number): string =>
  `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(amount)}`;
