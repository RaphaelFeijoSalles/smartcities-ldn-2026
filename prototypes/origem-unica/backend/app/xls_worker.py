"""POSIX bounded XLS parser subprocess. No imports from application modules."""
import json
import io
import math
import sys

MAX_BYTES = 1_048_576
MAX_OUTPUT = 4 * MAX_BYTES


def parse():
    # Fail closed on platforms without resource limits. Server target is Linux.
    import resource
    resource.setrlimit(resource.RLIMIT_AS, (256 * MAX_BYTES, 256 * MAX_BYTES))
    resource.setrlimit(resource.RLIMIT_CPU, (3, 3))
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
    import xlrd
    payload = sys.stdin.buffer.read(MAX_BYTES + 1)
    if not payload or len(payload) > MAX_BYTES:
        raise ValueError('file_size_limit')
    book = xlrd.open_workbook(file_contents=payload, on_demand=True, logfile=io.StringIO())
    try:
        if book.nsheets != 1:
            raise ValueError('xls_requires_one_sheet')
        sheet = book.sheet_by_index(0)
        if sheet.nrows > 5001 or sheet.ncols > 64:
            raise ValueError('xls_dimensions_limit')
        rows = []
        total_characters = 0
        for r in range(sheet.nrows):
            values = sheet.row_values(r)
            for c, value in enumerate(values):
                if sheet.cell_type(r, c) == xlrd.XL_CELL_ERROR:
                    raise ValueError('xls_error_cell')
                if len(str(value)) > 2048 or isinstance(value, float) and not math.isfinite(value):
                    raise ValueError('invalid_cell')
                total_characters += len(str(value))
                if total_characters > 2 * MAX_BYTES:
                    raise ValueError('xls_expanded_cell_limit')
            rows.append(values)
        result = json.dumps({'rows': rows}, ensure_ascii=False, allow_nan=False).encode()
        if len(result) > MAX_OUTPUT:
            raise ValueError('xls_output_limit')
        sys.stdout.buffer.write(result)
    finally:
        book.release_resources()


if __name__ == '__main__':
    try:
        parse()
    except BaseException:
        # No source content, exception strings, stack traces, filenames or parser logs.
        sys.stdout.write('{"error":"invalid_xls_or_resource_limit"}')
        raise SystemExit(2)
