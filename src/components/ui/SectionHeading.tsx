import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{ id?: string; className?: string }>;

export default function SectionHeading({ id, className = "", children }: Props) {
  return (
    <h2
      id={id}
      className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 ${className}`}
    >
      {children}
    </h2>
  );
}
