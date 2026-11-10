function flatten(value, prefix = "", output = {}) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    output[prefix] = Array.isArray(value)
      ? JSON.stringify(value)
      : value;

    return output;
  }

  const entries = Object.entries(value);

  if (entries.length === 0 && prefix) {
    output[prefix] = "{}";
  }

  for (const [key, child] of entries) {
    flatten(
      child,
      prefix ? `${prefix}.${key}` : key,
      output
    );
  }

  return output;
}

export function csvCell(value) {
  let text = value == null ? "" : String(value);

  if (
    typeof value !== "number" &&
    /^[\s]*[=+\-@]/.test(text)
  ) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export function recordsToCSV(records) {
  if (!records.length) return "\uFEFF";

  const rows = records.map((record) => flatten(record));
  const columns = [
    ...new Set(rows.flatMap((row) => Object.keys(row)))
  ];

  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) =>
      columns.map((column) => csvCell(row[column])).join(",")
    )
  ];

  return `\uFEFF${lines.join("\r\n")}`;
}

export function downloadCSV(records) {
  const blob = new Blob([recordsToCSV(records)], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `butterwaffle-responses-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
