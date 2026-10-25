"use strict";
/* Liladip — configuration. Choose the mode, and (for live use) enter the Supabase URL and anon key below. */
/* ============ CONFIG (tuneable) ============ */
const CFG={
  // 'demo'     : simulated, runs entirely in the visitor's browser; no database. For showing the site to clients.
  // 'supabase' : live, connected to the Supabase project configured below.
  mode:'demo',
  // Project Settings > API in the Supabase dashboard. Use the anon / publishable key only. NEVER the service_role / secret key.
  supabase:{url:'https://YOUR-PROJECT.supabase.co',anonKey:'YOUR-ANON-PUBLIC-KEY'},
  // Visual design chosen by the client: 'editorial'. (Others kept for reference: 'arch', 'bold', 'noir', 'soft', 'capsule', 'deco'.)
  design:'editorial',
  // First-time colour mode: 'light', 'dark', or 'auto' (follow the visitor's phone/computer setting). The sun/moon button in the header changes it and is remembered.
  theme:'light',
  // Demo mode only: shows the small design switcher in the bottom-left corner so a client can compare the designs. Set to false to hide it.
  designSwitcher:false,
  currency:'MVR',
  images:{maxPerProduct:6,maxDim:1200,quality:0.82,demo:{maxDim:800,quality:0.72}},  // images are resized in the browser before saving (demo uses smaller ones because browser storage is limited)
  showScents:false,   // overwritten at start-up from the store settings (Admin > Settings > Show scent information)
  heroMax:5,          // most products shown in the rotating hero banner (those ticked "Feature in hero banner" in Admin)
  heroInterval:6000,  // milliseconds each hero product stays on screen
  lowStock:5,
  // The three values below are defaults only; at start-up they are overwritten from the `settings` table (editable in Admin > Settings).
  taxRate:0,
  delivery:{maleFreeAbove:500,maleFee:50}
};
