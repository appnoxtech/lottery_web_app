import { type AxiosResponse } from "axios";
import { get } from "../api.util";

export const StaticPageType = {
  TERMS: 1,    // terms and conditions
  PRIVACY: 2,  // privacy policy
  RULES: 3,    // lottery rules
  TICKET: 4    // ticket footer content
} as const;

export type StaticPageType = typeof StaticPageType[keyof typeof StaticPageType];

const getStaticPages = async (
  pageType: StaticPageType,
): Promise<AxiosResponse | void> => {
  try {
    const response = await get(
      `pages/${pageType}`
    );
    return response;
  } catch (error: any) {
    console.error('Static pages error details:', {
      pageType,
      error: error?.response?.data || error?.message,
      status: error?.response?.status
    });
    throw error;
  }
};

export{
    getStaticPages,
}