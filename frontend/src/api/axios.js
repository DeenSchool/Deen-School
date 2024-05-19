import baseUrl from '@/utils/baseUrl';
import axios from 'axios';
export const api =axios.create({
    headers:{
        'Access-Control-Allow-Origin':'*',
        'Content-Type':'application/json',
    },
});

export const interceptors=()=>{
    api.interceptors.request.use((config)=>{
        config.baseURL=baseUrl;
        config.withCredentials=true;
        return config;
    },(err)=>Promise.reject(err))
}