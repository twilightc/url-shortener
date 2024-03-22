import ShortenUrlForm from '../components/ShortenUrlForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ShortenUrlForm></ShortenUrlForm>
    </main>
  );
}
