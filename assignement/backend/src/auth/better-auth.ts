import { Pool } from 'pg';

let authInstance: any = null;

try
{
  const mod = require('better-auth');
  const modMain = mod.default ?? mod;

  const organization = mod.organization ?? modMain.organization ?? null;
  const twoFactor = mod.twoFactor ?? modMain.twoFactor ?? null;

  const plugins: any[] = [];
  if (typeof organization === 'function') plugins.push(organization());
  if (typeof twoFactor === 'function') plugins.push(twoFactor());

  const DATABASE_URL = (process.env.DATABASE_URL || '').trim();

  const commonOpts: any = {
    emailAndPassword: { enabled: true },
    plugins,
  };

  if (DATABASE_URL)
    {
    commonOpts.database = new Pool({ connectionString: DATABASE_URL });
    }

    if (typeof modMain === 'function')
    {
        authInstance = modMain(commonOpts);
    } 
    else if (modMain && typeof modMain.api === 'function')
    {
        authInstance = modMain.api(commonOpts);
    } 
    else
    {
        authInstance = null;
    }
}
catch (e)
{
    authInstance = null;
}

export const auth = authInstance;
