const DataTable = ({
  columns,
  data,
  loading,
  rowKey,
  activeController,
  setActiveController,
}) => {
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-0 overflow-scroll">
      <table className="w-full mt-4 text-left table-auto max-w-max">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="p-4 border-y border-slate-200 bg-[#f7f7f7] max-w-45 truncate transition-colors cursor-pointer  hover:bg-slate-100"
              >
                <div className="flex justify-between gap-4">
                <p className="flex items-center justify-between text-sm font-normal leading-none text-slate-500">
                  {col.header}
                </p>
                <img src="/icons/arrow-vertical-svgrepo-com.svg" width="20px" alt="" />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody >
          {data.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((col, i) => (
                <td key={i} className="p-4 border-b border-slate-200 text-sm">
                  {col.render
                    ? col.render(row, activeController, setActiveController)
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;