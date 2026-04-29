export const retryP = async <T>(fn: ()=>Promise<T>, retries=3): Promise<T> => { try{ return await fn(); }catch(e){ if(retries===0)throw e; return retryP(fn, retries-1); } };
