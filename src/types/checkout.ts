export interface CheckoutPlanResponse {
  name: string;
  value: number;
}

export interface CheckoutCreateBody {
  planId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface CheckoutCreateResponse {
  checkoutUrl: string;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
}

export interface AsaasCustomerListResponse {
  data: AsaasCustomer[];
  totalCount: number;
  hasMore: boolean;
}

export interface AsaasCheckoutResponse {
  id: string;
  link: string;
  status: string;
}
