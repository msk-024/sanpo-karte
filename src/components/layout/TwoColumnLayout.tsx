import SideNav from "./SideNav";

type Props = {
  children: React.ReactNode;
};

export default function TwoColumnLayout({ children }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        minHeight: "calc(100vh - 48px)",
        alignItems: "start",
      }}
    >
      <main
        style={{
          padding: "24px",
          minHeight: "100%",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {children}
      </main>

      <SideNav />
    </div>
  );
}
