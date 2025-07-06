export default function WithoutHeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div id="dialog-portal" className="absolute z-[9999]"></div>

      {children}
    </>
  );
}
