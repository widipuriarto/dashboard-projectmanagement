import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useTable, createCoreRowModel, createPaginatedRowModel } from '@tanstack/react-table';

function Test() {
  const table = useTable({
    data: [],
    columns: [],
    getCoreRowModel: createCoreRowModel(),
    getPaginationRowModel: createPaginatedRowModel(),
  });
  console.log('table keys:', Object.keys(table));
  return createElement('div', null, 'ok');
}

renderToString(createElement(Test));

