import './globals.css';

export const metadata = {
  title: 'Smart Resume Screening',
  description: 'Resume-to-role screening with clear, recruiter-focused insights.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
