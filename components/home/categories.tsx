import { fetcher } from '@/lib/coingecko.actions';

import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { CategoriesFallback } from './fallback';
import DataTable from '../data-table';
import { PriceChangeDisplay } from '@/components/ui/price-change';

const Categories = async () => {
  try {
    /** Cache 5 min; categories change infrequently, reduces rate-limit pressure. */
    const categories = await fetcher<Category[]>('/coins/categories', undefined, 300);

    const columns: DataTableColumn<Category>[] = [
      { header: 'Category', cellClassName: 'font-medium', cell: (category) => category.name },
      {
        header: 'Top Gainers',
        headClassName: 'hidden sm:table-cell',
        cellClassName: 'hidden sm:table-cell',
        cell: (category) =>
          category.top_3_coins.map((coin) => (
            <Image
              src={coin}
              alt=""
              aria-hidden
              key={coin}
              width={28}
              height={28}
              className="inline-block rounded-full"
            />
          )),
      },
      {
        header: '24h Change',
        cellClassName: 'change-cell',
        cell: (category) => (
          <PriceChangeDisplay
            value={category.market_cap_change_24h}
            showIcon
          />
        ),
      },
      {
        header: 'Market Cap',
        headClassName: 'hidden md:table-cell',
        cellClassName: 'hidden md:table-cell',
        cell: (category) => formatCurrency(category.market_cap),
      },
      {
        header: '24h Volume',
        headClassName: 'hidden lg:table-cell',
        cellClassName: 'hidden lg:table-cell',
        cell: (category) => formatCurrency(category.volume_24h),
      },
    ];

    return (
      <div id="categories" className="custom-scrollbar">
        <h4 className="text-lg font-semibold tracking-tight">Top Categories</h4>

        <DataTable
          columns={columns}
          data={categories?.slice(0, 10)}
          rowKey={(_, index) => index}
          tableClassName="mt-3"
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return <CategoriesFallback />;
  }
};

export default Categories;