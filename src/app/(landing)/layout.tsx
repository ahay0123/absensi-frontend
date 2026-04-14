// Landing page layout - Public (tanpa AuthGuard)
// Sehingga landing page bisa diakses tanpa login

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
