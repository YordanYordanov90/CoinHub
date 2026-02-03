import React from 'react';


import DataTable from '../data-table';

export const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback" className="h-full min-h-0 flex flex-col">
      <div className="pt-2 flex items-center gap-3">
        <div className="header-image skeleton" />
        <div className="min-w-0">
          <div className="header-line-sm skeleton" />
          <div className="header-line-lg skeleton" />
        </div>
      </div>
      <div className="chart">
        <div className="chart-skeleton skeleton" />
      </div>
    </div>
  );
};

export const TrendingCoinsFallback = () => {
  const columns = [
    {
      header: 'Name',
      cell: () => (
        <div className="name-link">
          <div className="name-image skeleton" />
          <div className="name-line skeleton" />
        </div>
      ),
    },
    {
      header: '24h Change',
      cell: () => (
        <div className="price-change">
          <div className="change-icon skeleton" />
          <div className="change-line skeleton" />
        </div>
      ),
    },
    {
      header: 'Price',
      headClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      cell: () => <div className="price-line skeleton" />,
    },
  ];

  const dummyData = Array.from({ length: 6 }, (_, i) => ({ id: i }));

  return (
    <div id="trending-coins-fallback" className="h-full min-h-0 flex flex-col">
      <h4 className="text-lg font-semibold tracking-tight shrink-0">Trending Coins</h4>
      <div className="flex-1 min-h-0 flex flex-col mt-3">
        <DataTable
          data={dummyData}
          columns={columns as typeof columns}
          rowKey={(item: { id: number }) => item.id}
          tableClassName="trending-coins-table"
        />
      </div>
    </div>
  );
};

export const CategoriesFallback = () => {
  const columns = [
    {
      header: 'Category',
      cell: () => <div className="category-line skeleton" />,
    },
    {
      header: 'Top Gainers',
      headClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      cell: () => (
        <div className="flex gap-1">
          <div className="gainer-image skeleton" />
          <div className="gainer-image skeleton" />
          <div className="gainer-image skeleton" />
        </div>
      ),
    },
    {
      header: '24h Change',
      cell: () => (
        <div className="change-cell">
          <div className="change-icon skeleton" />
          <div className="change-line skeleton" />
        </div>
      ),
    },
    {
      header: 'Market Cap',
      headClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
      cell: () => <div className="value-skeleton-lg skeleton" />,
    },
    {
      header: '24h Volume',
      headClassName: 'hidden lg:table-cell',
      cellClassName: 'hidden lg:table-cell',
      cell: () => <div className="value-skeleton-md skeleton" />,
    },
  ];

  const dummyData = Array.from({ length: 10 }, (_, i) => ({ id: i }));

  return (
    <div id="categories-fallback">
      <h4 className="text-lg font-semibold tracking-tight">Top Categories</h4>
      <DataTable
        data={dummyData}
        columns={columns}
        rowKey={(item: { id: number }) => item.id}
        tableClassName="mt-3"
      />
    </div>
  );
};