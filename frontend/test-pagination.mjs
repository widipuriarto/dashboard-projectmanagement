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
  console.log('getCanPreviousPage:', typeof table.getCanPreviousPage);
  console.log('getPageCount:', typeof table.getPageCount);
  console.log('setPageIndex:', typeof table.setPageIndex);
  return createElement('div', null, 'ok');
}

renderToString(createElement(Test));

