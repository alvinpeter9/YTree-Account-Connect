import type { PropsWithChildren, ReactNode } from 'react';
import { heading, iconButton } from '../ui';

interface Props extends PropsWithChildren {
  title: string;
  description?: string;
  onClose: () => void;
  footer: ReactNode;
}

export function Modal({ title, description, onClose, footer, children }: Props) {
  return <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1b168f] p-5 backdrop-blur-[3px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="flex max-h-[min(720px,90vh)] w-[min(540px,100%)] flex-col rounded-[17px] bg-white shadow-[0_24px_70px_rgba(0,0,0,.22)]" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex justify-between gap-5 px-[26px] pt-[25px] pb-[18px]">
        <div><h2 className={`${heading} text-[27px]`} id="modal-title">{title}</h2>{description && <p className="mt-1.5 text-[13px] text-[#65716b]">{description}</p>}</div>
        <button className={iconButton} onClick={onClose} aria-label="Close dialog">×</button>
      </div>
      <div className="overflow-auto px-[26px] pt-[5px] pb-6">{children}</div>
      <div className="flex justify-end gap-[9px] border-t border-[#dfe5df] px-[26px] py-4">{footer}</div>
    </section>
  </div>;
}
