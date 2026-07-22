const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#377e6340]';

export const button = `${focusRing} inline-flex cursor-pointer items-center justify-center rounded-[9px] border px-[15px] py-2.5 text-[13px] font-semibold transition duration-200 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50`;
export const primaryButton = `${button} border-[#194f40] bg-[#194f40] text-white hover:not-disabled:-translate-y-px hover:not-disabled:border-[#123d32] hover:not-disabled:bg-[#123d32]`;
export const secondaryButton = `${button} border-[#cfd8d2] bg-white text-[#29463d] hover:not-disabled:-translate-y-px hover:not-disabled:border-[#76978a]`;
export const iconButton = `${focusRing} grid size-[34px] cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[21px] text-[#73817a] hover:bg-[#f0f3f0] disabled:cursor-not-allowed disabled:opacity-50`;
export const heading = 'font-serif font-semibold text-[#17231f]';
export const eyebrow = 'mb-2.5 text-[11px] font-bold tracking-[.13em] text-[#5d746b] uppercase';
export const field = 'flex flex-col gap-[7px] text-xs font-bold text-[#3d4c47]';
export const fieldInput = `${focusRing} rounded-[9px] border border-[#cfd7d2] bg-white px-3 py-[11px] text-[#21322c]`;
