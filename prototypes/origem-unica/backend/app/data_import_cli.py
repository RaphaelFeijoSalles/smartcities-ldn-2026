"""Local public-data profiling and JSON report export. Writes only to stdout."""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import sys
from pathlib import Path

from app.data_review import identify_report
from app.tabular_compare import compare
from app.tabular_import import MAX_BYTES, ImportRejected, analyze, read_table


def _read(path: str, limit: int) -> bytes:
    with Path(path).open('rb') as stream:
        content = stream.read(limit + 1)
    if len(content) > limit:
        raise ImportRejected('file_size_limit')
    return content


def snhis_example():
    """Derived example from the previously captured, versioned official snapshot.

    This does NOT download or independently verify the original XLS. Its SHA is
    retained as a claim from the existing snapshot; extraction lineage is explicit.
    """
    path = Path(__file__).resolve().parents[1] / 'tests/fixtures/snhis_londrina_official.json'
    payload = _read(str(path), MAX_BYTES)
    snapshot = json.loads(payload)
    record = snapshot['records']['4113700']
    source = snapshot['source']
    output = io.StringIO(newline='')
    writer = csv.writer(output)
    writer.writerow(['Codigo IBGE', 'Municipio', 'UF', 'Situacao Municipio'])
    writer.writerow([record['codigo_ibge'], record['nome'], record['uf'], record['situacao_fonte']])
    metadata = dict(name='SNHIS — amostra histórica derivada do snapshot versionado', url=source['url'],
                    reference_date=record['data_referencia'], version='snhis-repository-snapshot-v1',
                    classification='official_claimed', nature='housing_status', namespace='BR:IBGE:municipality-7')
    report, _ = analyze(read_table(output.getvalue().encode(), 'snhis-derived.csv'), metadata)
    report['lineage'] = dict(kind='derived_from_previously_captured_snapshot',
                            snapshot_path='tests/fixtures/snhis_londrina_official.json',
                            snapshot_sha256=hashlib.sha256(payload).hexdigest(),
                            original_xls_sha256_claimed=source['sha256'],
                            original_collected_at_claimed=source['downloaded_at'],
                            original_download_verified_this_run=False,
                            notice='Historical example; not current certification or fresh source collection.')
    return identify_report(report)


def main(argv=None):
    parser = argparse.ArgumentParser(description='Public non-personal CSV/XLS → deterministic JSON report')
    parser.add_argument('operation', choices=['profile', 'compare', 'snhis-example'])
    parser.add_argument('--left')
    parser.add_argument('--left-metadata', help='Provenance JSON, max 16 KiB')
    parser.add_argument('--right')
    parser.add_argument('--right-metadata')
    args = parser.parse_args(argv)
    try:
        if args.operation == 'snhis-example':
            report = snhis_example()
        else:
            if not args.left or not args.left_metadata:
                raise ImportRejected('left_file_and_metadata_required')
            left = read_table(_read(args.left, MAX_BYTES), Path(args.left).name)
            lm = json.loads(_read(args.left_metadata, 16384))
            if not isinstance(lm, dict):
                raise ImportRejected('invalid_provenance')
            if args.operation == 'profile':
                report = analyze(left, lm)[0]
            else:
                if not args.right or not args.right_metadata:
                    raise ImportRejected('right_file_and_metadata_required')
                right = read_table(_read(args.right, MAX_BYTES), Path(args.right).name)
                rm = json.loads(_read(args.right_metadata, 16384))
                if not isinstance(rm, dict):
                    raise ImportRejected('invalid_provenance')
                report = compare(left, lm, right, rm)
        print(json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False))
        return 0
    except (ImportRejected, OSError, UnicodeError, json.JSONDecodeError, KeyError) as exc:
        # Never echo OS paths, source records, or decoder excerpts.
        code = str(exc) if isinstance(exc, ImportRejected) else 'input_unavailable_or_invalid'
        print(json.dumps({'status': 'FAIL', 'error': code}), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
