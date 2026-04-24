export default function DataTable({ columns, rows, onRowClick, emptyMessage = 'No data found.' }) {
  const getRowLabel = (row) => {
    return columns
      .map((column) => `${column.label}: ${row[column.key] ?? ''}`)
      .join(', ');
  };

  const handleRowKeyDown = (event, row) => {
    if (!onRowClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className="table-wrap card">
      <table aria-label="Data table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">{emptyMessage}</td>
            </tr>
          ) : rows.map((row, index) => (
            <tr
              key={row.id ?? row.code ?? row.name ?? index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={(event) => handleRowKeyDown(event, row)}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              aria-label={onRowClick ? `Select row. ${getRowLabel(row)}` : undefined}
            >
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
