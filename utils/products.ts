export const productTaxTypeOld = (categoryName: string, taxValue: string) => {
    const isLiquor =categoryName === "liquor";
    const taxValueWithType = (isLiquor ? "VAT " : "GST ") + taxValue + "%";
    return taxValueWithType;
}

export const productTaxType = (categoryName: string, taxValue: string) => {
    const taxValueWithType = taxValue ? categoryName + " " + taxValue + "%": "";
    return taxValueWithType;
}