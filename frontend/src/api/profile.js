import api from './axios';
export const profileApi={get:()=>api.get('/profile'),upload:(file)=>{const body=new FormData();body.append('signature',file);return api.post('/profile/signature',body)},signature:()=>api.get('/profile/signature',{responseType:'blob'})};
