import {
  EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH,
  EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH,
  EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH,
} from "@/shared/api/exchange-info/schemas";

export type ExchangePostFormValues = {
  offersText: string;
  wantsText: string;
  description: string;
};

export function validateExchangePostFormValues(values: ExchangePostFormValues) {
  const offersInvalid =
    values.offersText.trim().length === 0 ||
    values.offersText.trim().length > EXCHANGE_INFO_OFFERS_TEXT_MAX_LENGTH;
  const wantsInvalid =
    values.wantsText.trim().length === 0 ||
    values.wantsText.trim().length > EXCHANGE_INFO_WANTS_TEXT_MAX_LENGTH;
  const descriptionInvalid =
    values.description.trim().length > EXCHANGE_INFO_DESCRIPTION_MAX_LENGTH;

  return { offersInvalid, wantsInvalid, descriptionInvalid };
}
