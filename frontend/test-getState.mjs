import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useTable, createCoreRowModel } from '@tanstack/react-table';

function Test() {
  const table = useTable({
    data: [],
    columns: [],
    getCoreRowModel: createCoreRowModel()
  });
  console.log('getState type:', typeof table.getState);
  console.log('state property:', table.state !== undefined);
  return createElement('div', null, 'ok');
}

renderToString(createElement(Test));

