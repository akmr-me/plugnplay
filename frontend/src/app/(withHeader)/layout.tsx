import Header from "@/components/header";

export default function WithoutHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header /> {children}
    </>
  );
}
