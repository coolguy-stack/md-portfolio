type Props = { children: string };

export default function Tag({ children }: Props) {
  return (
    <span className="text-xs sm:text-[13px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
      {children}
    </span>
  );
}
