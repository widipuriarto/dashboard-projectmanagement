import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useTable, createCoreRowModel } from '@tanstack/react-table';

function Test() {
  const table = useTable({
    data: [],
    columns: [],
    getCoreRowModel: createCoreRowModel()
  });
  return createElement('div', null, Object.keys(table).join(', '));
}

console.log(renderToString(createElement(Test)));

