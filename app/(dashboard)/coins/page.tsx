import CoinsTableClient from '@/components/features/coins/CoinList';

const Coins = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);

  return (
    <main className="container mx-auto  px-4 sm:px-6 py-8">
      <div className="content">
        <h4>All Coins</h4>
        <CoinsTableClient currentPage={currentPage} />
      </div>
    </main>
  );
};

export default Coins;
