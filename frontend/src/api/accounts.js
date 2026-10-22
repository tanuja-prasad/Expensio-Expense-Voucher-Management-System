import api from './axios';
export const accountsApi={
  dashboard:()=>api.get('/accounts/dashboard'),
  payments:(params={})=>api.get('/accounts/payments',{params}),
  updatePayment:(id,payment_status)=>api.patch(`/accounts/payments/${id}`,{payment_status}),
};
