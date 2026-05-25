import React from 'react';

export default function DataTable({ columns, data }) {
  return (
    <div className="w-full overflow-x-auto border-2 border-border bg-card shadow">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-foreground text-background">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className="py-3 px-4 text-xs font-bold uppercase tracking-wider border-r border-border last:border-r-0"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm font-medium text-foreground">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className="border-b-2 border-border hover:bg-muted transition-colors last:border-b-0"
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={`py-3 px-4 border-r-2 border-border last:border-r-0 ${col.isNumeric ? 'font-mono' : ''}`}
                >
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
