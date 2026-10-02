export function PageHeader({
  title,
  subtitle,
  detail,
}: {
  title: string;
  subtitle: string;
  detail?: React.ReactNode;
}) {
  return (
    <header className="mb-10 lg:mb-14">
      <h1 className="text-[44px] leading-none tracking-[-0.035em] text-ivory sm:text-[56px]">{title}</h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-secondary">{subtitle}</p>
      {detail ? <div className="mt-3 text-[14px] text-muted">{detail}</div> : null}
    </header>
  );
}
